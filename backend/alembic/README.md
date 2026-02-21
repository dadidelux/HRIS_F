# Database Migrations with Alembic

This directory contains database migration scripts managed by Alembic.

## Current Status

The application currently uses SQLAlchemy's `metadata.create_all()` to automatically create database tables on startup. The Alembic migrations are provided for future schema changes and production deployments.

## Migration Files

- `001_initial_schema.py` - Initial database schema with all tables (users, profiles, job_postings, applications, interviews)

## Common Commands

### View Current Migration Status
```bash
alembic current
```

### View Migration History
```bash
alembic history
```

### Upgrade to Latest Version
```bash
alembic upgrade head
```

### Downgrade One Version
```bash
alembic downgrade -1
```

### Create a New Migration (Auto-generate)
```bash
alembic revision --autogenerate -m "description of changes"
```

### Create a New Migration (Manual)
```bash
alembic revision -m "description of changes"
```

## Migration Workflow

### For Development
The application automatically creates tables using `metadata.create_all()` in `main.py`. This is convenient for rapid development and testing.

### For Production
1. Remove or comment out `metadata.create_all()` in `main.py`
2. Run migrations using Alembic:
   ```bash
   alembic upgrade head
   ```

## Schema Changes

When making changes to SQLAlchemy models:

1. **Development**: Tables will auto-update on restart (using metadata.create_all)
2. **Production**: Create a migration:
   ```bash
   alembic revision --autogenerate -m "add new field to users"
   alembic upgrade head
   ```

## Database URL

The database URL is configured in `alembic.ini`:
```
sqlalchemy.url = postgresql://hris_user:hris_password@postgres:5432/hris_db
```

For local testing outside Docker, update this URL as needed.

## Notes

- All migrations are stored in `alembic/versions/`
- The initial migration (001) represents the complete schema with all Phase 1-5 features
- Alembic tracks which migrations have been applied in the `alembic_version` table
