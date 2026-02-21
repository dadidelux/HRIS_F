from sqlalchemy import Column, String, Text, Date, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.database import Base


class JobStatus(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    CLOSED = "Closed"


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    category = Column(String(100), nullable=True)  # Job category for dashboard grouping
    location = Column(String(100), nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.ACTIVE, nullable=False)
    date_posted = Column(Date, default=datetime.utcnow().date, nullable=False)
    application_deadline = Column(Date, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, nullable=False)
    responsibilities = Column(JSON, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # User who created this posting
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    applications = relationship("Application", back_populates="job_posting")
    creator = relationship("User", foreign_keys=[created_by])
