# ADR-001 — Adoção de Arquitetura Orientada a Eventos

| Campo       | Valor                        |
|-------------|------------------------------|
| **Status**  | Aceito                       |
| **Data**    | 2025-08-10                   |
| **Autores** | Time de Plataforma           |

---

## Contexto

A plataforma nasceu como um monólito modular. Com o crescimento do volume de pedidos e o aumento do número de times, o acoplamento entre módulos começou a gerar problemas:

- Deploys interdependentes entre times
- Falhas em um módulo afetando outros
- Dificuldade de escalar partes específicas do sistema
- Testes de integração lentos e frágeis

Foi necessário avaliar uma estratégia de evolução arquitetural que reduzisse o acoplamento e aumentasse a autonomia dos times.

## Decisão

Adotar **arquitetura orientada a eventos** (EDA) como padrão de integração entre serviços da plataforma.

Os serviços se comunicam via **eventos de domínio** publicados em um broker de mensagens (RabbitMQ localmente, Azure Service Bus em produção). Comunicação síncrona via HTTP é mantida apenas quando estritamente necessário.

## Alternativas consideradas

### Opção A — Manter monólito modular com APIs internas

**Prós:** simplicidade, transações ACID entre módulos, sem latência de rede.

**Contras:** acoplamento de deploy entre times, impossibilidade de escalar módulos individualmente, falhas propagadas diretamente.

**Descartada** porque o crescimento de times tornaria o acoplamento de deploy insustentável.

---

### Opção B — REST síncrono entre serviços

**Prós:** simples de implementar, fácil de depurar, sem overhead de broker.

**Contras:** acoplamento de disponibilidade entre serviços, cascata de falhas, timeouts em pico de carga, retry storms.

**Descartada** porque a disponibilidade do payments-service impactaria diretamente a criação de pedidos.

---

### Opção C — Event-Driven com broker de mensagens (escolhida)

**Prós:**

- Desacoplamento de disponibilidade entre produtores e consumidores
- Escala independente por serviço
- Resiliência a falhas transitórias
- Histórico de eventos para auditoria e replay

**Contras:**

- Consistência eventual (não imediata)
- Complexidade operacional do broker
- Necessidade de consumidores idempotentes
- Depuração mais difícil sem boa observabilidade

## Consequências

### Positivas

- Times podem fazer deploy de seus serviços de forma independente
- Falha no `payments-service` não bloqueia a criação de pedidos
- Fila absorve picos de carga no processamento de pagamentos
- Eventos podem ser reprocessados em caso de bug no consumidor

### Negativas / Riscos

- Consistência eventual: o status do pedido pode não refletir o pagamento imediatamente
- Cada consumidor deve implementar **idempotência** para lidar com entrega duplicada
- Dead-letter queues precisam de monitoramento ativo
- Debugging de fluxos distribuídos requer rastreamento (correlation IDs, tracing)

## Mitigações adotadas

- **Outbox Pattern**: garante que eventos sejam publicados transacionalmente
- **Correlation ID**: propagado em todos os eventos e logs
- **Dead-letter queues**: monitoradas com alertas no Grafana
- **OpenTelemetry**: rastreamento distribuído habilitado em todos os serviços

!!! note "Revisão"
    Esta decisão será revisada se o volume de mensagens exigir substituição do broker ou se a complexidade operacional superar os benefícios.
