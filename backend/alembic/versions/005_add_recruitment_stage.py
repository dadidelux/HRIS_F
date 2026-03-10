"""Add recruitment_stage column to applications

Revision ID: 005
Revises: 004
Create Date: 2026-03-10
"""
from alembic import op
import sqlalchemy as sa

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('applications', sa.Column('recruitment_stage', sa.String(50), nullable=True))


def downgrade():
    op.drop_column('applications', 'recruitment_stage')
