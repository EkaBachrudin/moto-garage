.PHONY: help dev build up down restart logs clean install-db shell nuke db-migrate db-rollback db-status db-reset db-shell

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '$(BLUE)Moto Garage - Development Commands$(NC)'
	@echo ''
	@echo '$(GREEN)Usage:$(NC)'
	@echo '  make <target>'
	@echo ''
	@echo '$(GREEN)Available targets:$(NC)'
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

dev: ## Start development mode (build and run all services)
	@echo '$(BLUE)🚀 Starting development environment...$(NC)'
	docker compose -f docker-compose.dev.yml up --build

dev-detached: ## Start development mode in background
	@echo '$(BLUE)🚀 Starting development environment in background...$(NC)'
	docker compose -f docker-compose.dev.yml up -d --build
	@echo '$(GREEN)✓ Services started! Access the app at http://localhost:8080$(NC)'
	@echo '$(YELLOW)Run "make logs" to view logs$(NC)'

build: ## Build all containers
	@echo '$(BLUE)🔨 Building containers...$(NC)'
	docker compose -f docker-compose.dev.yml build

up: ## Start all services (without rebuild)
	@echo '$(BLUE)▶️  Starting services...$(NC)'
	docker compose -f docker-compose.dev.yml up

down: ## Stop all services
	@echo '$(YELLOW)⏹️  Stopping services...$(NC)'
	docker compose -f docker-compose.dev.yml down

restart: ## Restart all services
	@echo '$(YELLOW)🔄 Restarting services...$(NC)'
	docker compose -f docker-compose.dev.yml restart

logs: ## View logs from all services
	docker compose -f docker-compose.dev.yml logs -f

logs-backend: ## View backend logs only
	docker compose -f docker-compose.dev.yml logs -f backend

logs-frontend: ## View frontend logs only
	docker compose -f docker-compose.dev.yml logs -f frontend

logs-db: ## View database logs only
	docker compose -f docker-compose.dev.yml logs -f postgres

ps: ## Show running containers
	docker compose -f docker-compose.dev.yml ps

clean: ## Stop and remove all containers, volumes, and images
	@echo '$(RED)🧹 Cleaning up everything...$(NC)'
	docker compose -f docker-compose.dev.yml down -v --rmi all
	@echo '$(GREEN)✓ Cleanup complete$(NC)'

shell-backend: ## Open shell in backend container
	docker compose -f docker-compose.dev.yml exec backend sh

shell-db: ## Open psql in database container
	docker compose -f docker-compose.dev.yml exec postgres psql -U moto_garage -d moto_garage

status: ## Show status of all services
	@echo '$(BLUE)📊 Container Status:$(NC)'
	@docker compose -f docker-compose.dev.yml ps
	@echo ''
	@echo '$(BLUE)📡 URLs:$(NC)'
	@echo '  Frontend:     http://localhost:5173'
	@echo '  Nginx Proxy:  http://localhost:8080'
	@echo '  Backend API:  http://localhost:3000'
	@echo '  PostgreSQL:   localhost:5432'

rebuild-backend: ## Rebuild and restart backend only
	@echo '$(BLUE)🔨 Rebuilding backend...$(NC)'
	docker compose -f docker-compose.dev.yml up -d --build backend

rebuild-frontend: ## Rebuild and restart frontend only
	@echo '$(BLUE)🔨 Rebuilding frontend...$(NC)'
	docker compose -f docker-compose.dev.yml up -d --build frontend

nuke: ## 🚨 Remove ALL containers, images, volumes, and networks (destructive!)
	@echo '$(RED)⚠️  WARNING: This will remove ALL Docker data!$(NC)'
	@echo '$(RED)Including:$(NC)'
	@echo '  - All containers (stopped and running)'
	@echo '  - All images (including unused)'
	@echo '  - All volumes (DATABASE DATA WILL BE LOST!)'
	@echo '  - All custom networks'
	@echo '  - All build cache'
	@echo ''
	@echo '$(YELLOW)Press Ctrl+C to abort, or wait 5 seconds...$(NC)'
	@sleep 5
	@echo '$(RED)☢️  NUKING EVERYTHING...$(NC)'
	@docker compose -f docker-compose.dev.yml down -v --rmi all 2>/dev/null || true
	@docker container prune -f
	@docker image prune -a -f
	@docker volume prune -f
	@docker network prune -f
	@docker builder prune -a -f
	@echo '$(GREEN)✓ Complete! Docker is now clean.$(NC)'

# ============================================
# Database Migration Commands
# ============================================

db-migrate: ## Run pending database migrations
	@echo '$(BLUE)🔄 Running database migrations...$(NC)'
	cd moto-garage-be && DB_HOST=localhost DB_PORT=5432 DB_USER=moto_garage DB_PASSWORD=moto_garage_password DB_NAME=moto_garage npx ts-node --project tsconfig.dev.json src/utils/migrate.ts up

db-rollback: ## Rollback last database migration
	@echo '$(YELLOW)⏪ Rolling back last migration...$(NC)'
	cd moto-garage-be && DB_HOST=localhost DB_PORT=5432 DB_USER=moto_garage DB_PASSWORD=moto_garage_password DB_NAME=moto_garage npx ts-node --project tsconfig.dev.json src/utils/migrate.ts down

db-status: ## Show database migration status
	@echo '$(BLUE)📊 Migration Status:$(NC)'
	cd moto-garage-be && DB_HOST=localhost DB_PORT=5432 DB_USER=moto_garage DB_PASSWORD=moto_garage_password DB_NAME=moto_garage npx ts-node --project tsconfig.dev.json src/utils/migrate.ts status

db-reset: ## Drop and recreate database (WARNING: deletes all data)
	@echo '$(RED)⚠️  WARNING: This will DELETE ALL DATA!$(NC)'
	@echo '$(YELLOW)Press Ctrl+C to abort, or wait 3 seconds...$(NC)'
	@sleep 3
	@echo '$(RED)💥 Resetting database...$(NC)'
	@docker compose -f docker-compose.dev.yml exec postgres psql -U moto_garage -d postgres -c "DROP DATABASE IF EXISTS moto_garage;"
	@docker compose -f docker-compose.dev.yml exec postgres psql -U moto_garage -d postgres -c "CREATE DATABASE moto_garage;"
	@echo '$(GREEN)✓ Database reset. Run "make db-migrate" to create tables.$(NC)'

db-seed: ## Run database seed data
	@echo '$(BLUE)🌱 Seeding database...$(NC)'
	@echo '$(YELLOW)Note: Seed data is included in migrations. Run "make db-migrate" instead.$(NC)'

db-connect: ## Open psql shell to database
	docker compose -f docker-compose.dev.yml exec postgres psql -U moto_garage -d moto_garage

db-info: ## Show database connection info
	@echo '$(BLUE)📡 Database Connection Info:$(NC)'
	@echo ''
	@echo 'For TablePlus / DBeaver / pgAdmin:'
	@echo '  Host:     localhost'
	@echo '  Port:     5432'
	@echo '  User:     moto_garage'
	@echo '  Password: moto_garage_password'
	@echo '  Database: moto_garage'
	@echo ''
