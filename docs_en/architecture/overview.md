# Architecture Overview

The platform follows an event-driven architecture with autonomous services. Each service owns its own database and communicates via asynchronous messaging, except in cases where latency demands synchronous calls.

## C4 Diagram — Container Level

```
┌────────────────────────────────────────────────────────┐
│                      Clients                           │
│         (Mobile App, Web App, B2B Partners)            │
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

## Adopted Principles

### 1. Database per Service

Each service owns its own database. There is no direct cross-service database access. Consistency across services is eventual, guaranteed via domain events.

### 2. Asynchronous Communication by Default

Integration between services is done via messaging (RabbitMQ locally, Azure Service Bus in production). Synchronous calls (HTTP) are used only for:

- Catalog reads during order creation
- Health checks between services

### 3. Outbox Pattern

To guarantee that events are published even in case of failure after a database write, we use the **Outbox Pattern**. The transaction that persists the entity also persists the message in the `outbox_messages` table. A secondary worker publishes the pending messages.

!!! warning "Eventual consistency"
    Operations that span across services are not atomic. Design consumers to be **idempotent** and handle duplicate delivery scenarios.

## Technologies and Versions

| Component          | Technology               | Version  |
|--------------------|--------------------------|----------|
| Runtime            | .NET                     | 8.0      |
| HTTP Framework     | ASP.NET Core             | 8.0      |
| ORM                | Entity Framework Core    | 8.0      |
| Database           | PostgreSQL               | 16       |
| Messaging (local)  | RabbitMQ                 | 3.13     |
| Messaging (prod)   | Azure Service Bus        | Standard |
| Observability      | OpenTelemetry + Grafana  | —        |
| Containerization   | Docker + Kubernetes      | —        |

## Order Flow

```
Client → orders-api → validates stock (catalog-api) → persists order
       → publishes OrderPlaced (Outbox)
       → payments-service consumes OrderPlaced → processes charge
       → publishes PaymentConfirmed
       → orders-api consumes PaymentConfirmed → updates status to Confirmed
       → notification-worker consumes PaymentConfirmed → sends email/push
```
