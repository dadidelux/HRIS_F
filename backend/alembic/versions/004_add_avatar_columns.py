"""Add avatar columns to users table

Revision ID: 004
Revises: 003
Create Date: 2026-03-01
"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('avatar_data', sa.LargeBinary(), nullable=True))
    op.add_column('users', sa.Column('avatar_content_type', sa.String(50), nullable=True))


def downgrade():
    op.drop_column('users', 'avatar_content_type')
    op.drop_column('users', 'avatar_data')
