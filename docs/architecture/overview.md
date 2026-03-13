# Visão Geral da Arquitetura

A plataforma segue uma arquitetura orientada a eventos com serviços autônomos. Cada serviço possui sua própria base de dados e se comunica via mensageria assíncrona, exceto em casos onde a latência exige chamadas síncronas.

## Diagrama C4 — Nível de Contêiner

```
┌────────────────────────────────────────────────────────┐
│                     Clientes                           │
│        (App Mobile, Web App, Parceiros B2B)            │
└──────────────────────┬─────────────────────────────────┘
                       │ HTTPS
                       ▼
              ┌────────────────┐
              │   API Gateway  │  (Kong / YARP)
              └───────┬────────┘
         ┌────────────┼────────────┐
         ▼            ▼            ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │orders-api│  │catalog-  │  │payments- │
   │          │  │api       │  │service   │
   └────┬─────┘  └──────────┘  └────┬─────┘
        │                           │
        └──────────┬────────────────┘
                   ▼
           ┌──────────────┐
           │  RabbitMQ /  │
           │  Azure SB    │
           └──────┬───────┘
                  ▼
        ┌─────────────────┐
        │notification-    │
        │worker           │
        └─────────────────┘
```

## Princípios adotados

### 1. Database per Service

Cada serviço possui seu próprio banco de dados. Não há acesso direto entre bases de serviços distintos. A consistência entre serviços é eventual, garantida via eventos de domínio.

### 2. Comunicação assíncrona por padrão

A integração entre serviços é feita via mensageria (RabbitMQ em ambiente local, Azure Service Bus em produção). Chamadas síncronas (HTTP) são usadas apenas para:

- Leitura de catálogo durante criação de pedido
- Health checks entre serviços

### 3. Outbox Pattern

Para garantir que eventos sejam publicados mesmo em caso de falha após a escrita no banco, utilizamos o **Outbox Pattern**. A transação que persiste a entidade também persiste a mensagem na tabela `outbox_messages`. Um worker secundário publica as mensagens pendentes.

!!! warning "Consistência eventual"
    Operações que transitam entre serviços não são atômicas. Projete consumidores para serem **idempotentes** e trate cenários de entrega duplicada.

## Tecnologias e versões

| Componente         | Tecnologia               | Versão   |
|--------------------|--------------------------|----------|
| Runtime            | .NET                     | 8.0      |
| Framework HTTP     | ASP.NET Core             | 8.0      |
| ORM                | Entity Framework Core    | 8.0      |
| Banco de dados     | PostgreSQL               | 16       |
| Mensageria (local) | RabbitMQ                 | 3.13     |
| Mensageria (prod)  | Azure Service Bus        | Standard |
| Observabilidade    | OpenTelemetry + Grafana  | —        |
| Containerização    | Docker + Kubernetes      | —        |

## Fluxo de um pedido

```
Cliente → orders-api → valida estoque (catalog-api) → persiste pedido
       → publica OrderPlaced (Outbox)
       → payments-service consome OrderPlaced → processa cobrança
       → publica PaymentConfirmed
       → orders-api consome PaymentConfirmed → atualiza status para Confirmed
       → notification-worker consome PaymentConfirmed → envia e-mail/push
```
