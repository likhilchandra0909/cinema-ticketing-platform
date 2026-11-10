# Cinema Ticketing Platform - Deployment and Recovery Runbook

## 1. Purpose

This runbook describes how to start, verify, monitor, troubleshoot, and recover the Cinema Ticketing Platform deployment.

## 2. Deployment Environment

| Component | Configuration |
|---|---|
| API | Node.js + Express |
| Database | PostgreSQL 17 |
| Reverse Proxy | Nginx |
| Container Runtime | Docker |
| Orchestration | Docker Compose |
| HTTP Port | 8081 |
| HTTPS Port | 8443 |
| API Port | 3000 (localhost only) |
| Database Port | 5433 (localhost only) |

## 3. Start the Application

Navigate to the project directory:

```powershell
cd C:\Users\abhiu\cinema-ticketing-platform
```

Start the application:

```powershell
docker compose up -d --build
```

## 4. Verify Deployment

Check container status:

```powershell
docker compose ps
```

Check API health:

```powershell
curl.exe -k https://localhost:8443/health
```

Check available shows:

```powershell
curl.exe -k https://localhost:8443/api/shows
```

Expected health response:

```json
{
  "status": "UP",
  "service": "Cinema Ticketing API"
}
```

## 5. Monitor Application Logs

View API logs:

```powershell
docker logs --tail 50 cinema-api
```

View Nginx logs:

```powershell
docker logs --tail 50 cinema-nginx
```

View database logs:

```powershell
docker logs --tail 50 cinema-postgres
```

## 6. Restart and Recovery

Restart only the API:

```powershell
docker restart cinema-api
```

Verify recovery:

```powershell
curl.exe -k https://localhost:8443/health
```

Check all services:

```powershell
docker compose ps
```

## 7. Database Backup

Create a backup:

```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

docker exec cinema-postgres pg_dump -U cinema_user -d cinema_ticketing -F c -f "/tmp/cinema-backup-$timestamp.dump"

docker cp "cinema-postgres:/tmp/cinema-backup-$timestamp.dump" "backups/cinema-backup-$timestamp.dump"
```

## 8. Database Restore

Create a separate restore database:

```powershell
docker exec cinema-postgres psql -U cinema_user -d postgres -c "CREATE DATABASE cinema_restore_test OWNER cinema_user;"
```

Restore the backup:

```powershell
docker exec cinema-postgres pg_restore -U cinema_user -d cinema_restore_test --no-owner "/tmp/cinema-backup.dump"
```

Verify restored records:

```sql
SELECT COUNT(*) FROM public."Show";
SELECT COUNT(*) FROM public."Seat";
SELECT COUNT(*) FROM public."Reservation";
```

Restore into a separate database for testing to avoid overwriting production data.

## 9. Docker Image Rollback

Use the previously published GHCR image tag containing the required Git commit SHA.

Rollback configuration:

```text
compose.rollback.yaml
```

Validate the rollback configuration:

```powershell
docker compose -f compose.rollback.yaml config --quiet
```

After rollback, verify the API health endpoint and ensure the database and persistent volume remain intact.

Restore the latest application image using the normal Compose configuration.

## 10. Troubleshooting

| Problem | Suggested check |
|---|---|
| API unavailable | Check `docker logs cinema-api` |
| Database unavailable | Check PostgreSQL health and logs |
| Nginx unavailable | Check Nginx logs and configuration |
| HTTPS failure | Verify certificate and Nginx configuration |
| Container unhealthy | Inspect container health and application logs |
| Reservation conflict | Check existing active reservation |
| Database recovery issue | Verify backup archive and restore target |

## 11. Security Precautions

- Never commit `.env` files or private TLS keys.
- Keep database and API ports restricted to localhost.
- Use HTTPS for client access.
- Run the application container as a non-root user.
- Scan production images for vulnerabilities.
- Preserve database volumes during application rollback.

## 12. Recovery Verification

The project includes evidence of:

- API container restart and recovery.
- Database backup and restore.
- Docker image rollback.
- API health verification through HTTPS.
- Container health checks.

Evidence is maintained in the `evidence/` directory.