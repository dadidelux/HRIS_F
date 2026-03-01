"""Add resumes table

Revision ID: 002
Revises: 001
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create parsing status enum
    op.execute("CREATE TYPE resumeparsingstatus AS ENUM ('pending', 'completed', 'failed')")

    # Create resumes table
    op.create_table('resumes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_data', sa.LargeBinary(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('content_type', sa.String(length=100), nullable=False, server_default='application/pdf'),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('parsed_data', sa.JSON(), nullable=True),
        sa.Column('parsing_status', postgresql.ENUM('pending', 'completed', 'failed', name='resumeparsingstatus', create_type=False), nullable=False, server_default='pending'),
        sa.Column('parsing_error', sa.Text(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.Column('parsed_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index on user_id for faster lookups
    op.create_index(op.f('ix_resumes_user_id'), 'resumes', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_resumes_user_id'), table_name='resumes')
    op.drop_table('resumes')
    op.execute('DROP TYPE IF EXISTS resumeparsingstatus')
