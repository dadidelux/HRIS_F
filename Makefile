.PHONY: help build up down logs clean seed restart dev prod

help:
	@echo "HRIS Management Commands"
	@echo "========================"
	@echo "make build      - Build all Docker images"
	@echo "make up         - Start all services"
	@echo "make down       - Stop all services"
	@echo "make logs       - View logs from all services"
	@echo "make clean      - Stop services and remove volumes"
	@echo "make seed       - Seed database with sample data"
	@echo "make restart    - Restart all services"
	@echo "make dev        - Start development mode with hot reload"
	@echo "make prod       - Start production mode"
	@echo "make shell-be   - Open shell in backend container"
	@echo "make shell-fe   - Open shell in frontend container"
	@echo "make shell-db   - Open PostgreSQL shell"

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	@echo "All services stopped and volumes removed"

seed:
	docker-compose exec backend python seed_data.py

restart:
	docker-compose restart

dev:
	docker-compose --profile dev up
	@echo "Development mode started"
	@echo "Frontend Dev: http://localhost:5173"

prod:
	docker-compose up -d
	@echo "Production mode started"

shell-be:
	docker-compose exec backend /bin/bash

shell-fe:
	docker-compose exec frontend /bin/sh

shell-db:
	docker-compose exec postgres psql -U postgres -d hris_db

status:
	docker-compose ps
