# Moto Garage - Docker Setup

Docker setup untuk Moto Garage yang mendukung development dan production mode dengan PostgreSQL, Frontend, Backend, dan Nginx.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx (Port 80)                      │
│                     Reverse Proxy / Load Balancer            │
└─────────────────────┬──────────────────┬────────────────────┘
                      │                  │
                      ▼                  ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   Frontend (React)      │    │   Backend (Express)      │
│   Development: Port 5173│    │   Port: 3000             │
│   Production: Nginx     │    │                          │
└─────────────────────────┘    └───────────┬─────────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │   PostgreSQL     │
                                  │   Port: 5432     │
                                  └──────────────────┘
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Environment Variables

### Development (.env.development)
```env
DB_USER=moto_garage
DB_PASSWORD=moto_garage_password
DB_NAME=moto_garage_dev
DB_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:8080/api
NGINX_PORT=8080
```

### Production (.env.production)
```env
DB_USER=moto_garage
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
DB_NAME=moto_garage
DB_PORT=5432
BACKEND_PORT=3000
NODE_ENV=production
VITE_API_URL=/api
```

## Development Mode

Development mode mendukung hot-reload untuk frontend dan backend.

### Menjalankan Development Mode

```bash
# Copy environment file
cp .env.development.example .env.development

# Jalankan semua services
docker compose -f docker-compose.dev.yml --env-file .env.development up -d

# Atau tanpa detached mode untuk melihat logs
docker compose -f docker-compose.dev.yml --env-file .env.development up
```

### Access Development URLs

- **Application**: http://localhost:8080
- **Frontend (direct)**: http://localhost:5173
- **Backend (direct)**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### Fitur Development Mode

- Hot-reload untuk Frontend (Vite)
- Hot-reload untuk Backend (nodemon + ts-node)
- Volume mounts untuk source code
- Health checks untuk database

### Stop Development Mode

```bash
docker compose -f docker-compose.dev.yml down
# Hapus volumes termasuk database data
docker compose -f docker-compose.dev.yml down -v
```

## Production Mode

Production mode menggunakan build assets dan tanpa hot-reload.

### Menjalankan Production Mode

```bash
# Buat production environment file
cp .env.production.example .env.production

# Edit .env.production dan ganti DB_PASSWORD dengan password yang kuat
nano .env.production

# Jalankan production services
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Access Production URLs

- **Application**: http://localhost (port 80)
- **Backend API**: http://localhost/api

### Stop Production Mode

```bash
docker compose -f docker-compose.prod.yml down
# Hapus volumes termasuk database data
docker compose -f docker-compose.prod.yml down -v
```

## Useful Commands

### View Logs

```bash
# Semua services
docker compose -f docker-compose.dev.yml logs -f

# Service tertentu
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f postgres
```

### Rebuild Services

```bash
# Build ulang tanpa cache
docker compose -f docker-compose.dev.yml build --no-cache

# Build ulang dan restart
docker compose -f docker-compose.dev.yml up -d --build
```

### Execute Commands in Container

```bash
# Masuk ke container backend
docker compose -f docker-compose.dev.yml exec backend sh

# Masuk ke container database
docker compose -f docker-compose.dev.yml exec postgres psql -U moto_garage -d moto_garage_dev

# Run npm command di frontend
docker compose -f docker-compose.dev.yml exec frontend npm install <package>
```

### Database Management

```bash
# Backup database
docker compose -f docker-compose.dev.yml exec postgres pg_dump -U moto_garage moto_garage_dev > backup.sql

# Restore database
docker compose -f docker-compose.dev.yml exec -T postgres psql -U moto_garage moto_garage_dev < backup.sql

# Access database directly
docker compose -f docker-compose.dev.yml exec postgres psql -U moto_garage -d moto_garage_dev
```

## Troubleshooting

### Port sudah digunakan

Jika port 8080 atau 3000 sudah digunakan, ubah di `.env.development`:
```env
NGINX_PORT=8081
BACKEND_PORT=3001
```

### Hot-reload tidak berfungsi

Pastikan `vite.config.ts` sudah dikonfigurasi dengan:
```typescript
server: {
  host: true,
  watch: {
    usePolling: true,
  },
}
```

### Permission issues dengan volumes

```bash
# Fix volume permissions
docker compose -f docker-compose.dev.yml down
sudo rm -rf postgres_dev_data
docker compose -f docker-compose.dev.yml up -d
```

### Database connection failed

Pastikan database sudah healthy:
```bash
docker compose -f docker-compose.dev.yml ps
```

Tunggu sampai status postgres: `healthy`

## File Structure

```
moto-garage/
├── docker-compose.dev.yml          # Development compose
├── docker-compose.prod.yml         # Production compose
├── .env.development                # Development environment
├── .env.production                 # Production environment
├── .env.development.example        # Environment template
├── .env.production.example         # Environment template
├── docker/
│   ├── development/
│   │   └── nginx.conf             # Nginx dev config
│   └── production/
│       └── nginx.conf             # Nginx prod config
├── moto-garage-fe/
│   ├── Dockerfile                 # Frontend multi-stage build
│   ├── .dockerignore
│   ├── docker/
│   │   └── nginx.conf             # Nginx static files config
│   └── vite.config.ts             # Vite config with Docker support
└── moto-garage-be/
    ├── Dockerfile                 # Backend multi-stage build
    └── .dockerignore
```

## Security Notes untuk Production

1. **SELALU** ganti password default di `.env.production`
2. Gunakan password yang kuat untuk database
3. Enable SSL/TLS untuk nginx
4. Gunakan secrets management untuk environment variables
5. Jangan commit `.env.production` ke version control
6. Gunakan `.dockerignore` untuk menghindari exposing sensitive files

## Next Steps

1. Install dependencies PostgreSQL di backend (`npm install pg`)
2. Setup database schema dan migrations
3. Configure SSL certificates untuk production
4. Setup CI/CD pipeline
5. Configure backup strategy untuk database
