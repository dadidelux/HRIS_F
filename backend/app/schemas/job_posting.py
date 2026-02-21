from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID
from enum import Enum


class JobStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    CLOSED = "Closed"


class JobPostingBase(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=255)
    department: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    requirements: List[str] = Field(..., min_items=1)
    responsibilities: List[str] = Field(..., min_items=1)
    application_deadline: date


class JobPostingCreate(JobPostingBase):
    pass


class JobPostingUpdate(BaseModel):
    job_title: Optional[str] = Field(None, min_length=1, max_length=255)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1)
    requirements: Optional[List[str]] = None
    responsibilities: Optional[List[str]] = None
    application_deadline: Optional[date] = None
    status: Optional[JobStatus] = None


class JobPostingResponse(JobPostingBase):
    id: UUID
    status: JobStatus
    date_posted: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
