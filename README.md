# Kudo Platform Backend

A powerful employee recognition and peer-to-peer appreciation platform built with NestJS.

## 🚀 Features

- **Peer Recognition**: Send kudos with points to colleagues.
- **Real-time Notifications**: Instant updates via WebSockets (Socket.io).
- **Gamification**: Track giving budgets and earned points.
- **Reward Catalog**: Redeem earned points for rewards.
- **Media Support**: Image uploads for kudos and comments via MinIO (S3-compatible).
- **Background Processing**: Reliable email and notification delivery using BullMQ & Redis.
- **Google OAuth**: Fast and secure authentication.

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Caching & Queues**: [Redis](https://redis.io/)
- **Task Queue**: [BullMQ](https://docs.bullmq.io/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Object Storage**: [MinIO](https://min.io/) (S3-compatible)
- **API Documentation**: [Swagger/OpenAPI](https://swagger.io/)

---

## 📋 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (for infrastructure)

---

## ⚙️ Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd amanotes-be
npm install
```

### 2. Infrastructure Setup
The easiest way to start the required services (DB, Redis, MinIO) is using Docker Compose:
```bash
# Start infrastructure only (DB, Redis, MinIO)
docker-compose up -d database redis minio
```

### 3. Environment Configuration
Copy the template and fill in the secrets:
```bash
cp .env.example .env
```
Key variables to check:
- `DATABASE_URL`: Ensure it points to your PostgreSQL instance.
- `REDIS_PASSWORD`: Must match what's in your docker-compose.
- `GOOGLE_CLIENT_ID` / `SECRET`: Required for login.
- `FRONTEND_URL`: Where the backend should redirect after OAuth.

### 4. Database Initialization
Generate the Prisma client and push the schema to the database:
```bash
# Generate Prisma Client
npm run migration:generate

# Push schema to database
npx prisma db push

# (Optional) Seed initial data (Admin user, Rewards, etc.)
npx prisma db seed
```

### 5. Running the App
```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

---

## 🏗 Docker Deployment

To run the **entire platform** (including the backend itself) via Docker:
```bash
docker-compose up -d --build
```
This will build the backend image and start all services defined in `docker-compose.yaml`.

---

## 📑 API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
- **Local**: `http://localhost:3000/docs`
- **Production**: `https://<your-domain>/docs`

---

## 🛠 Common Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start NestJS in watch mode |
| `npm run build` | Build the project for production |
| `npm run migration:run` | Create and run a new database migration |
| `npx prisma studio` | Open a GUI to view/edit your database data |
| `npm run lint` | Run ESLint to check code quality |

---

## 📄 License
This project is [UNLICENSED](LICENSE).
