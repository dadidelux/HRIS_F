from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.db.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    HR = "hr"
    CANDIDATE = "candidate"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CANDIDATE, nullable=False)
    profile_picture = Column(String(500), nullable=True)
    is_active = Column(String(10), default="true", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False)
    applications = relationship("Application", back_populates="user")
    job_postings_created = relationship("JobPosting", foreign_keys="[JobPosting.created_by]", overlaps="creator")
