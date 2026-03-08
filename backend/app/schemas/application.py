"""
Pydantic schemas for Application operations
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID


class TimelineEvent(BaseModel):
    """Timeline event for application status changes"""
    status: str
    timestamp: str
    note: Optional[str] = None


class ApplicationBase(BaseModel):
    job_posting_id: UUID
    cover_letter: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    cover_letter: Optional[str] = None


class JobPostingInfo(BaseModel):
    """Simplified job posting info for application response"""
    id: UUID
    job_title: str
    department: str
    location: str
    status: str

    class Config:
        from_attributes = True


class ApplicantInfo(BaseModel):
    """Simplified user info for application response"""
    id: UUID
    full_name: str
    email: str

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: UUID
    user_id: UUID
    job_posting_id: UUID
    status: str
    applied_date: date
    cover_letter: Optional[str]
    documents: List[dict] = []
    timeline: List[dict] = []
    created_at: datetime
    updated_at: datetime

    # Related data
    job_posting: Optional[JobPostingInfo] = None
    user: Optional[ApplicantInfo] = None

    class Config:
        from_attributes = True
