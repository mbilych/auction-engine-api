# Auction Engine API

This project is a **production-ready real-time auction engine**, built with **NestJS**, PostgreSQL, and Redis.  
It provides a consistent, concurrency-safe bidding system with real-time updates, suitable for the majority of real-world auction scenarios.

The core focus of this project is **correctness under concurrency**, predictable behavior under load, and clean separation between business logic and real-time delivery.

---

## Key Capabilities

- Atomic bid placement with strict ordering guarantees
- Database-level concurrency control
- Real-time bid and auction state updates
- Anti-sniping (last-second bid protection)
- Background processing for auction lifecycle management
- Full audit log of auction events

---

## Functional Overview

### Auction Lifecycle

Auctions are implemented as a state machine managed by background services.

Supported states:

- `CREATED`
- `ACTIVE`
- `FINISHED`

A scheduler service monitors `startsAt` and `endsAt` timestamps and automatically transitions auctions between states.  
When an auction finishes, a background worker determines the winning bid and persists the final winner.

All significant events (bids, state transitions) are written to an immutable audit log for traceability.

---

### Bidding Logic

Bid placement is handled atomically inside a database transaction.

Key properties:

- Only `ACTIVE` auctions accept bids
- Each bid must be at least `currentPrice + minStep`
- Bid increments must respect the configured step
- Concurrent bids are serialized using **pessimistic row-level locking**
- The auction row is locked for the minimal transaction scope only

This guarantees:

- No race conditions
- No lost updates
- Deterministic winner selection

---

### Anti-Sniping Protection

To ensure fairness in competitive auctions, the system implements **anti-sniping protection**.

If a bid is placed within the final time window before auction expiration, the auction end time is automatically extended.  
This prevents last-second bids from unfairly winning without giving other participants time to respond.

---

### Real-Time Updates

Real-time delivery is decoupled from business logic.

- WebSockets are implemented using Socket.io
- Domain events are emitted via NestJS EventEmitter
- Clients subscribe to auction-specific channels
- Price updates, new bids, and auction state changes are broadcast instantly
- Server time is included in updates to keep client-side countdowns synchronized

---

## Production Readiness and Scalability

At its current stage, this project represents a **complete, production-grade auction engine** rather than a proof of concept.

### What It Is Designed For

- Typical online auctions
- Hundreds of concurrent users per auction
- Approximately **100–1000 bids per auction**
- Multiple active auctions running in parallel

The use of database transactions with pessimistic locking provides strong consistency guarantees while remaining performant under realistic auction traffic patterns.

This design is suitable for **~99% of auction use cases** where correctness and fairness are more important than extreme throughput.

---

### Traffic-Driven Enhancements

Further improvements should be introduced **only when justified by real traffic**:

- **Request throttling / rate limiting**  
  To protect against excessive bid submissions or denial-of-service patterns.

- **Idempotency guarantees**  
  Required once duplicate client submissions or UI retries appear.

- **Explicit lock timeouts**  
  Useful if lock wait times exceed acceptable thresholds (e.g. >1–2 seconds).

- **Database indexing**  
  On auction and bid entities as data volume grows.

- **Metrics and monitoring**  
  For visibility into latency, contention, and system health.

- **Redis-based read optimization**  
  For read-heavy operations (current price, auction state), while keeping all writes strongly consistent in PostgreSQL.

---

### Scaling Beyond Typical Auctions

Extremely high-contention scenarios (e.g. tens of thousands of users bidding simultaneously on a single auction) require fundamentally different architectural approaches, such as:

- Event sourcing
- In-memory aggregation
- Batched bid processing
- Deferred winner calculation

These approaches trade strict real-time guarantees for throughput and are intentionally out of scope for this project.

---

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Queues**: Redis + Bull
- **Real-time**: Socket.io
- **Validation**: class-validator

---

## Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL
- Redis
- Yarn

### Environment Configuration

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=auction_db

REDIS_HOST=localhost
REDIS_PORT=6379

PORT=8555
```

### Installation

```bash
yarn install
```

### Database Setup

```bash
yarn db:up
```

### Running the Services

```bash
# API (business logic + WebSockets)
yarn start:dev

# Scheduler (cron jobs + background workers)
yarn start:scheduler:dev
```

---

## Project Scope

This repository focuses on the **auction engine itself**:

- correctness
- concurrency safety
- real-time consistency

Authentication, payments, UI, and external integrations are intentionally left out to keep the core logic isolated and reusable.

---
