"""
Pydantic schemas for Interview operations
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time
from uuid import UUID


class InterviewBase(BaseModel):
    application_id: UUID
    interview_date: date
    interview_time: time
    location: str
    interview_type: str
    notes: Optional[str] = None
    interviewer_name: Optional[str] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    interview_date: Optional[date] = None
    interview_time: Optional[time] = None
    location: Optional[str] = None
    interview_type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    interviewer_name: Optional[str] = None


class ApplicationInfo(BaseModel):
    """Simplified application info for interview response"""
    id: UUID
    user_id: UUID
    job_posting_id: UUID
    status: str

    class Config:
        from_attributes = True


class InterviewResponse(BaseModel):
    id: UUID
    application_id: UUID
    interview_date: date
    interview_time: time
    location: str
    interview_type: str
    status: str
    notes: Optional[str]
    interviewer_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    # Related data
    application: Optional[ApplicationInfo] = None

    class Config:
        from_attributes = True
