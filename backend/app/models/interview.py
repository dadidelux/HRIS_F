"""
Interview Model - Interview scheduling and management
"""
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Date, Time, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.database import Base


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "Scheduled"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    RESCHEDULED = "Rescheduled"


class InterviewType(str, enum.Enum):
    PHONE = "Phone"
    VIDEO = "Video"
    IN_PERSON = "In-Person"
    PANEL = "Panel"


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)

    # Interview details
    interview_date = Column(Date, nullable=False)
    interview_time = Column(Time, nullable=False)
    location = Column(String(255), nullable=False)  # Physical address or video call link
    interview_type = Column(Enum(InterviewType), default=InterviewType.VIDEO, nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED, nullable=False)

    # Additional information
    notes = Column(Text, nullable=True)
    interviewer_name = Column(String(255), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    application = relationship("Application", back_populates="interviews")
