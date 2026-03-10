"""
Application Model - Job application tracking
"""
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, JSON, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.database import Base


class ApplicationStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROCESS = "In-Process"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    WITHDRAWN = "Withdrawn"


class RecruitmentStage(str, enum.Enum):
    INITIAL_SCREENING = "Initial Screening"
    TEACHING_DEMO = "Teaching Demo"
    INTERVIEW = "Interview"
    FINAL_SELECTION = "Final Selection"
    JOB_OFFER = "Job Offer"
    ONBOARDING = "Onboarding"


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_posting_id = Column(UUID(as_uuid=True), ForeignKey("job_postings.id"), nullable=False)

    # Application details
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    recruitment_stage = Column(String(50), nullable=True)  # RecruitmentStage value
    applied_date = Column(Date, default=datetime.utcnow().date, nullable=False)
    cover_letter = Column(String(2000), nullable=True)

    # Structured data
    documents = Column(JSON, default=list, nullable=False)  # List of document metadata
    timeline = Column(JSON, default=list, nullable=False)   # List of status change events

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="applications")
    job_posting = relationship("JobPosting", back_populates="applications")
    interviews = relationship("Interview", back_populates="application")
