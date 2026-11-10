# Cinema Ticketing Platform

A containerized Cinema Ticketing Platform with a reservation API, PostgreSQL database, automated CI/CD pipeline, HTTPS reverse proxy, and reservation concurrency protection.

## 1. Project Overview

The Cinema Ticketing Platform provides REST APIs to manage movie shows, view seat availability, temporarily hold seats, confirm reservations, and cancel bookings.

The application is designed to prevent multiple customers from booking the same seat simultaneously. It uses Docker for containerization, PostgreSQL for persistent data storage, GitHub Actions for CI/CD, and Nginx as an HTTPS reverse proxy.

## 2. Key Features

- Movie show listing and seat availability.
- Temporary seat reservations with 5-minute expiry.
- Reservation confirmation and cancellation.
- Prevention of duplicate seat reservations.
- Unique booking codes for reservations.
- Concurrent reservation testing.
- PostgreSQL persistent storage.
- Docker multi-stage production build.
- Non-root application container.
- Docker health checks and restart policies.
- Nginx reverse proxy with HTTPS.
- Structured JSON application logs.
- GitHub Actions automated testing and image publishing.
- Trivy container vulnerability scanning.
- Database backup and restore verification.
- Docker image rollback and recovery.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | PostgreSQL 17 |
| ORM | Prisma |
| Containerization | Docker |
| Container Orchestration | Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Container Registry | GitHub Container Registry (GHCR) |
| Testing | Jest, Supertest |
| Security Scanning | Trivy |
| Logging | Winston |
| HTTPS | OpenSSL, Nginx |

## 4. System Architecture

```mermaid
flowchart TD
    A[Client / Browser] -->|HTTPS :8443| B[Nginx Reverse Proxy]
    B -->|HTTP :3000 internal| C[Node.js Express API]
    C --> D[Prisma ORM]
    D --> E[(PostgreSQL Database)]
    F[GitHub Repository] --> G[GitHub Actions CI/CD]
    G --> H[Automated Tests]
    G --> I[Docker Image Build]
    I --> J[GitHub Container Registry]
    K[Trivy Scanner] --> I
```

## 5. Project Structure

```text
cinema-ticketing-platform/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── app.js
│   └── server.js
│
├── tests/
│   ├── api.test.js
│   └── concurrency.test.js
│
├── nginx/
│   ├── conf.d/
│   └── certs/
│
├── backups/
├── evidence/
├── Dockerfile
├── compose.yaml
├── compose.rollback.yaml
├── .dockerignore
├── .gitignore
└── README.md
```

## 6. Installation and Setup

### Prerequisites

- Node.js 24 or later
- npm
- Docker Desktop
- Git

### Clone the repository

```bash
git clone https://github.com/likhilchandra0909/cinema-ticketing-platform.git
cd cinema-ticketing-platform
```

### Configure environment variables

Create a `.env` file in the project root using the following structure:

```env
POSTGRES_USER=your_database_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=cinema_ticketing

DATABASE_URL=postgresql://your_database_user:your_secure_password@localhost:5433/cinema_ticketing?schema=public
```

Use the same database credentials in both the PostgreSQL and connection settings.

Do not commit `.env` or private keys to GitHub.

### Install dependencies

```bash
npm ci
```

### Generate Prisma Client

```bash
npx prisma generate --config prisma7.config.ts
```

### Apply database migrations

```bash
npx prisma migrate deploy --config prisma7.config.ts
```

### Seed sample data

```bash
node prisma/seed.js
```

## 7. Docker Deployment

Build and start the application:

```bash
docker compose up -d --build
```

Check container status:

```bash
docker compose ps
```

View API logs:

```bash
docker logs cinema-api
```

The deployment includes:

- Node.js API container.
- PostgreSQL database container.
- Nginx reverse proxy container.
- Persistent PostgreSQL volume.
- Container health checks.

The API and database host ports are restricted to localhost. Nginx exposes the application through ports 8081 and 8443.

## 8. HTTPS Configuration

Nginx acts as the reverse proxy and forwards incoming HTTPS requests to the Node.js API.

- HTTP port: 8081
- HTTPS port: 8443
- API internal port: 3000

The local deployment uses a self-signed TLS certificate for demonstration purposes.

Test the health endpoint:

```bash
curl -k https://localhost:8443/health
```

The `-k` option allows curl to accept the self-signed certificate. Production deployments should use a certificate issued by a trusted certificate authority.

## 9. API Documentation

Base URL:

```text
https://localhost:8443
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health status |
| GET | `/api/shows` | List available shows |
| GET | `/api/shows/:id/seats` | Retrieve seat availability |
| POST | `/api/reservations/hold` | Create temporary seat hold |
| POST | `/api/reservations/:id/confirm` | Confirm reservation |
| POST | `/api/reservations/:id/cancel` | Cancel reservation |

### Create a temporary reservation

```http
POST /api/reservations/hold
Content-Type: application/json
```

Request:

```json
{
  "showId": 1,
  "seatId": 1
}
```

A successful request creates a temporary hold for five minutes and returns a unique booking code.

### Confirm reservation

```http
POST /api/reservations/58/confirm
```

### Cancel reservation

```http
POST /api/reservations/58/cancel
```

The cancelled reservation releases its active seat key, allowing the seat to become available again.

### Duplicate reservation protection

The application uses a unique active seat key to prevent multiple active reservations for the same seat.

A duplicate reservation attempt returns HTTP 409 Conflict.

## 10. CI/CD Pipeline

GitHub Actions automates the build and validation process.

The workflow runs on pushes and pull requests targeting the `main` branch.

Pipeline stages:

1. Checkout source code.
2. Configure Node.js.
3. Install dependencies.
4. Generate Prisma Client.
5. Apply database migrations.
6. Seed sample database records.
7. Execute automated tests.
8. Audit production dependencies.
9. Build Docker image.
10. Publish the Docker image to GHCR on pushes to `main`.

Published image:

```text
ghcr.io/likhilchandra0909/cinema-ticketing-platform
```

Images are tagged using:

- `latest`
- Git commit SHA

GitHub Actions:

https://github.com/likhilchandra0909/cinema-ticketing-platform/actions

Container package:

https://github.com/users/likhilchandra0909/packages/container/package/cinema-ticketing-platform

## 11. Testing

Run automated tests:

```bash
npm test
```

Run tests sequentially:

```bash
npm test -- --runInBand
```

The test suites cover:

- API health endpoint.
- Show listing.
- Seat availability.
- Invalid show handling.
- Reservation creation and lifecycle.
- Concurrent reservation attempts.

The concurrency test submits ten simultaneous reservation requests for the same seat and verifies that only one succeeds.

## 12. Security Measures

- Docker multi-stage production build.
- Non-root application execution.
- Helmet security middleware.
- Environment-based database credentials.
- Localhost-only API and database port bindings.
- HTTPS through Nginx.
- Read-only Nginx configuration and certificate mounts.
- Production dependency audit.
- Trivy container vulnerability scanning.
- Git ignore rules for secrets and local files.

## 13. Logging and Monitoring

Winston provides structured JSON application logs.

Each HTTP request records:

- Timestamp.
- HTTP method.
- Request URL.
- Response status code.
- Response time.

View application logs:

```bash
docker logs --tail 50 cinema-api
```

Container health:

```bash
docker compose ps
```

## 14. Database Backup and Restore

Create a PostgreSQL backup:

```bash
docker exec cinema-postgres pg_dump -U cinema_user -d cinema_ticketing -F c -f /tmp/cinema-backup.dump
```

Copy the backup to the local machine:

```bash
docker cp cinema-postgres:/tmp/cinema-backup.dump backups/cinema-backup.dump
```

Restore into a separate test database:

```bash
docker exec cinema-postgres pg_restore -U cinema_user -d cinema_restore_test --no-owner /tmp/cinema-backup.dump
```

The project includes evidence verifying that the backup was restored and the database records were checked.

## 15. Rollback and Recovery

The project demonstrates Docker image rollback using a previously published GHCR image tagged with its Git commit SHA.

Rollback configuration is maintained separately in:

```text
compose.rollback.yaml
```

The rollback test verifies:

- Previous image deployment.
- API health after rollback.
- Restoration of the latest application image.
- Preservation of the database and persistent volume.
- Continued operation of the Nginx reverse proxy.

## 16. Evidence

The `evidence/` directory contains project verification records, including:

- Container status.
- API logs.
- Backup and restore results.
- Recovery test.
- GHCR publishing evidence.
- Rollback verification.
- Trivy vulnerability scan.

## 17. Project Information

**Project:** Cinema Ticketing Platform  
**Module:** Show and Seat Reservation API  
**Category:** Cloud Deployment and CI/CD  
**Repository:** https://github.com/likhilchandra0909/cinema-ticketing-platform

## 18. Future Enhancements

- User authentication and role-based access control.
- Payment gateway integration.
- Automated scheduled database backups.
- Production TLS certificate management.
- Cloud VM deployment.
- Advanced monitoring dashboards.
- Rate limiting and API performance optimization.

---

**Note:** This project is a demonstration implementation. The local HTTPS deployment uses a self-signed certificate and simulated reservation payments.