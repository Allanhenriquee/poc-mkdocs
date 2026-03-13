# Plataforma de Pedidos

Bem-vindo à documentação técnica da **Plataforma de Pedidos**. Esta documentação cobre a arquitetura, APIs, decisões técnicas e guias operacionais do sistema.

## O que é esta plataforma?

A Plataforma de Pedidos é um sistema backend responsável por gerenciar o ciclo de vida completo de pedidos e pagamentos. Ela foi construída com foco em:

- **Resiliência**: tolerância a falhas com filas de mensagens e retentativas controladas
- **Escalabilidade**: serviços independentes com fronteiras bem definidas
- **Observabilidade**: logs estruturados, métricas e rastreamento distribuído

## Componentes principais

| Serviço             | Responsabilidade                              | Tecnologia         |
|---------------------|-----------------------------------------------|--------------------|
| `orders-api`        | Recebe e processa pedidos dos clientes        | ASP.NET Core 8     |
| `payments-service`  | Orquestra cobranças e estornos                | ASP.NET Core 8     |
| `notification-worker` | Envia notificações assíncronas              | .NET Worker Service |
| `catalog-api`       | Gerencia produtos e preços                    | ASP.NET Core 8     |

## Links rápidos

- [Visão geral da arquitetura](architecture/overview.md)
- [Referência da API](api/reference.md)
- [Configuração do ambiente local](guides/local-setup.md)

!!! info "Versão atual"
    Versão da plataforma: **2.4.1** — última atualização em março de 2026.
