# ADR-001 — Adoption of Event-Driven Architecture

| Field       | Value                        |
|-------------|------------------------------|
| **Status**  | Accepted                     |
| **Date**    | 2025-08-10                   |
| **Authors** | Platform Team                |

---

## Context

The platform started as a modular monolith. As order volume grew and the number of teams increased, coupling between modules began causing problems:

- Interdependent deployments between teams
- Failures in one module affecting others
- Difficulty scaling specific parts of the system
- Slow and brittle integration tests

It became necessary to evaluate an architectural evolution strategy that would reduce coupling and increase team autonomy.

## Decision

Adopt **event-driven architecture** (EDA) as the standard integration pattern between platform services.

Services communicate via **domain events** published to a message broker (RabbitMQ locally, Azure Service Bus in production). Synchronous HTTP communication is kept only when strictly necessary.

## Considered Alternatives

### Option A — Keep modular monolith with internal APIs

**Pros:** simplicity, ACID transactions across modules, no network latency.

**Cons:** deployment coupling between teams, inability to scale modules independently, failures propagate directly.

**Discarded** because team growth would make deployment coupling unsustainable.

---

### Option B — Synchronous REST between services

**Pros:** simple to implement, easy to debug, no broker overhead.

**Cons:** availability coupling between services, cascading failures, timeouts under peak load, retry storms.

**Discarded** because payments-service availability would directly impact order creation.

---

### Option C — Event-Driven with message broker (chosen)

**Pros:**

- Availability decoupling between producers and consumers
- Independent scaling per service
- Resilience to transient failures
- Event history for auditing and replay

**Cons:**

- Eventual consistency (not immediate)
- Operational complexity of the broker
- Need for idempotent consumers
- Harder to debug without good observability

## Consequences

### Positive

- Teams can deploy their services independently
- Failure in `payments-service` does not block order creation
- Queue absorbs load spikes in payment processing
- Events can be reprocessed in case of a consumer bug

### Negative / Risks

- Eventual consistency: order status may not immediately reflect payment
- Each consumer must implement **idempotency** to handle duplicate delivery
- Dead-letter queues require active monitoring
- Debugging distributed flows requires tracing (correlation IDs, distributed tracing)

## Adopted Mitigations

- **Outbox Pattern**: guarantees events are published transactionally
- **Correlation ID**: propagated in all events and logs
- **Dead-letter queues**: monitored with alerts in Grafana
- **OpenTelemetry**: distributed tracing enabled across all services

!!! note "Review"
    This decision will be revisited if message volume demands broker replacement or if operational complexity outweighs the benefits.
