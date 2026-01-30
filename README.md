# Auction Engine API

This project is the core of a real-time auction system, built with **NestJS**. It manages the auction lifecycle, handles bidding, and ensures instantaneous synchronization with clients.

## Functional Requirements Implementation

### 2.1 Auction (Core Logic)

Implemented as a state-machine managed by background services:

- **States**: The `Auction` entity supports `CREATED`, `ACTIVE`, and `FINISHED` statuses.
- **Auto-Start/End**: A dedicated **Scheduler Service** (Cron) monitors `startsAt` and `endsAt` timestamps. It automatically transitions auctions to `ACTIVE` when they begin and `FINISHED` when they expire.
- **Winner Determination**: Upon completion, a **Bull Queue Processor** identifies the highest bid, links it to the auction as the winner, and persists the final winning user.
- **Audit Log**: Every significant event (bid placement, status change) is recorded in the `AuctionLog` table, capturing payload data and timestamps for full traceability.

### 2.2 Bidding Logic

Robust bidding handled via `BidService`:

- **Place Bid**: Atomic bid creation within a **Database Transaction** to ensure data consistency.
- **Validation**:
  - **Minimum Step**: Rejects bids that are not at least `currentPrice + minStep`.
  - **Relevance**: Bids are only accepted for auctions in the `ACTIVE` status.
- **Concurrency Control**: Protected against race conditions using TypeORM transactions and database-level constraints.
- **Anti-Sniping (Auction Extension)**: If a bid is placed within the last 30 seconds of an auction, the `endsAt` time is automatically extended by 30 seconds.

### 2.3 Real-Time Implementation

Separation of concerns is maintained between business logic and the real-time layer:

- **WebSockets (Socket.io)**: Managed via `EventsGateway`. It is decoupled from services using **NestJS EventEmitter**.
- **Live Updates**:
  - Updates for current price and new bids are pushed to specific auction rooms.
  - State changes (e.g., transition to `FINISHED`) are broadcasted globally.
- **Timer Sync**: The server sends its current time with every update to ensure frontend countdowns remain synchronized even with network latency.

## Core Features

- 🔄 **Auction Lifecycle**: Automated transitions and demo-mode reset.
- ⚡ **Real-time Bidding**: Instant broadcasting via WebSockets.
- 🛡️ **Sniper Protection**: Dynamic end-time extension.
- 📦 **Queues & Tasks**: Bull (Redis) for background processing.
- ✅ **Robust Validation**: class-validator and custom service-level checks.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Queues**: Redis + Bull
- **Real-time**: Socket.io
- **Validation**: class-validator

## Local Setup

### 1. Prerequisites

- **Node.js** (v18+)
- **Redis** and **PostgreSQL**
- **Yarn** package manager

### 2. Environment Configuration

Create a `.env` file in the root directory:

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

### 3. Installation

```bash
yarn install
```

### 4. Database Setup

```bash
# Run migrations (includes demo data)
yarn db:up
```

### 5. Running the Apps

```bash
# Start API (Main business logic & WebSockets)
yarn start:dev

# Start Scheduler (Cron jobs & Queue processing)
yarn start:scheduler:dev
```

## Future Enhancements

- 🔐 JWT-based Authentication
- 💳 Payment Gateway Integration
- 🌓 Dark Mode Support
- 🌐 Internationalization (i18n)
