"""Initial database schema

Revision ID: 001
Revises:
Create Date: 2026-02-21 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('admin', 'hr', 'candidate', name='userrole'), nullable=False),
        sa.Column('profile_picture', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.String(length=10), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create profiles table
    op.create_table('profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('skills', sa.JSON(), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('documents', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

    # Create job_postings table
    op.create_table('job_postings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_title', sa.String(length=255), nullable=False),
        sa.Column('department', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('location', sa.String(length=100), nullable=False),
        sa.Column('status', sa.Enum('Active', 'Inactive', 'Closed', name='jobstatus'), nullable=False),
        sa.Column('date_posted', sa.Date(), nullable=False),
        sa.Column('application_deadline', sa.Date(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('requirements', sa.JSON(), nullable=False),
        sa.Column('responsibilities', sa.JSON(), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create applications table
    op.create_table('applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_posting_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.Enum('Pending', 'In-Process', 'Accepted', 'Rejected', 'Withdrawn', name='applicationstatus'), nullable=False),
        sa.Column('applied_date', sa.Date(), nullable=False),
        sa.Column('cover_letter', sa.String(length=2000), nullable=True),
        sa.Column('documents', sa.JSON(), nullable=False),
        sa.Column('timeline', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['job_posting_id'], ['job_postings.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create interviews table
    op.create_table('interviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('application_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('interview_date', sa.Date(), nullable=False),
        sa.Column('interview_time', sa.Time(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('interview_type', sa.Enum('Phone', 'Video', 'In-Person', 'Panel', name='interviewtype'), nullable=False),
        sa.Column('status', sa.Enum('Scheduled', 'Completed', 'Cancelled', 'Rescheduled', name='interviewstatus'), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('interviewer_name', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('interviews')
    op.drop_table('applications')
    op.drop_table('job_postings')
    op.drop_table('profiles')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS interviewstatus')
    op.execute('DROP TYPE IF EXISTS interviewtype')
    op.execute('DROP TYPE IF EXISTS applicationstatus')
    op.execute('DROP TYPE IF EXISTS jobstatus')
    op.execute('DROP TYPE IF EXISTS userrole')
