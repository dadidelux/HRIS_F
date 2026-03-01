"""Add embedding cache table

Revision ID: 003
Revises: 002
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('embedding_cache',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('text_hash', sa.String(length=64), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('embedding', sa.JSON(), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('cached_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_embedding_cache_text_hash'),
        'embedding_cache', ['text_hash'], unique=True
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_embedding_cache_text_hash'), table_name='embedding_cache')
    op.drop_table('embedding_cache')
