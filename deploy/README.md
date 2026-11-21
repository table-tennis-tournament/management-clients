# Production deployment

`docker-compose.yml` here runs the tagged release `v8.0.2-beta` from published images. It builds nothing from the
working tree. The development stack in the repository root builds from source and seeds test data; don't use it for a
tournament.

| Service | Image | Reachable |
|---|---|---|
| `clients` | `holzleube/ttt-clients:v8.0.2-beta` | `http://<host>:80/admin-view`, `/tablemanager-view`, `/result-view` |
| `management-backend` | `holzleube/ttt-management:v8.0.2-beta` | internal only, through the clients' nginx (`/api/v2`, `/ttt-websocket`) |
| `mariadb` | `mariadb:13` | host `127.0.0.1:3306` by default |
| `cups` | built from `cups/` at tag `v8.0.2-beta` | internal only |

The published images are `linux/amd64` only.

## Start

```bash
cd deploy
cp .env.example .env      # set the passwords and TTT_DATABASE
docker compose up -d
docker compose ps         # all services healthy / running
```

## Health and readiness

The stack reports whether it is ready:

```bash
./check-ready.sh http://<host>     # nginx, readiness, the three apps, a WebSocket handshake; exit code 0 = ready
curl http://<host>/readyz          # database, mktt's tables, Flyway, WebSocket broker, with details
```

`/readyz` is 503 while one check is DOWN, e.g. `mkttSchema` with `missingTables` when the wrong dump is loaded or
`TTT_DATABASE` names another database.

The healthchecks use the same endpoints: `management-backend` is healthy when `/readyz` is UP, `clients` when nginx
answers `/healthz`. `docker compose ps` therefore shows `management-backend` unhealthy until the right dump is loaded.

## Load the mktt database

The backend runs on the database that mktt prepares. Set `TTT_DATABASE` to the database name in the dump (its
`CREATE DATABASE` / `USE` lines). The backend's Flyway migrations add their `mgmt_` tables on start.

- **Before the first start:** put the dump (`*.sql` or `*.sql.gz`) into `initdb/`. MariaDB loads it once, when it
  creates the data volume.
- **On a running stack:**

  ```bash
  docker compose exec -T mariadb sh -c 'mariadb -uroot -p"$MARIADB_ROOT_PASSWORD"' < dump.sql
  docker compose restart management-backend
  ```

  If the dump creates the database, MariaDB loads it as root. The backend's user `TTT_DB_USER` has privileges on
  `TTT_DATABASE` only.

`lower_case_table_names=1` is set before MariaDB creates the volume, so the Windows dumps load as they are. Don't
change it later: it would need a new volume.

## Printing

Without `CUPS_PRINTER_URI`, the PDF printer takes every job and writes the files into the `cups-output` volume.
For a network printer, set `CUPS_PRINTER_URI`, `CUPS_PRINTER_NAME` and `DEFAULT_PRINTER` (the same name) in `.env`.
`docker compose build cups` needs network access to github.com.

## Update to a new release

Replace `v8.0.2-beta` in `docker-compose.yml` (three images and the cups build context), then:

```bash
docker compose pull && docker compose up -d --build
```

## Backup

```bash
docker compose exec -T mariadb sh -c 'mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --databases "$MARIADB_DATABASE"' > backup.sql
```

`docker compose down -v` deletes the database volume. Use `docker compose down` without `-v`.
