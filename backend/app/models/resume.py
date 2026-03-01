"""
Resume Model - User resume storage and parsed data
"""
from sqlalchemy import Column, String, Text, ForeignKey, JSON, DateTime, Enum, LargeBinary, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.database import Base


class ResumeParsingStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # File storage
    filename = Column(String(255), nullable=False)
    file_data = Column(LargeBinary, nullable=False)  # PDF binary (BYTEA)
    file_size = Column(Integer, nullable=False)  # File size in bytes
    content_type = Column(String(100), default="application/pdf", nullable=False)

    # Extracted and parsed content
    extracted_text = Column(Text, nullable=True)  # Raw text from PDF
    parsed_data = Column(JSON, nullable=True)  # Structured JSON from Gemini

    # Parsing status
    parsing_status = Column(
        Enum(ResumeParsingStatus, values_callable=lambda x: [e.value for e in x]),
        default=ResumeParsingStatus.PENDING,
        nullable=False
    )
    parsing_error = Column(Text, nullable=True)  # Error message if parsing failed

    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    parsed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="resume")
