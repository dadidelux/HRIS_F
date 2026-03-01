from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.database import get_db
from app.models.job_posting import JobPosting
from app.schemas.job_posting import (
    JobPostingCreate,
    JobPostingUpdate,
    JobPostingResponse,
)
from app.services.matching.cache_service import cache_service

router = APIRouter()


@router.get("/", response_model=List[JobPostingResponse])
def get_all_job_postings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all job postings"""
    job_postings = db.query(JobPosting).offset(skip).limit(limit).all()
    return job_postings


@router.get("/{job_id}", response_model=JobPostingResponse)
def get_job_posting(job_id: UUID, db: Session = Depends(get_db)):
    """Get a specific job posting by ID"""
    job_posting = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job_posting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )
    return job_posting


@router.post("/", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
def create_job_posting(
    job_data: JobPostingCreate,
    db: Session = Depends(get_db)
):
    """Create a new job posting"""
    job_posting = JobPosting(**job_data.model_dump())
    db.add(job_posting)
    db.commit()
    db.refresh(job_posting)
    return job_posting


@router.put("/{job_id}", response_model=JobPostingResponse)
def update_job_posting(
    job_id: UUID,
    job_data: JobPostingUpdate,
    db: Session = Depends(get_db)
):
    """Update a job posting"""
    job_posting = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job_posting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )

    update_data = job_data.model_dump(exclude_unset=True)

    old_requirements = list(job_posting.requirements or [])
    requirements_changed = "requirements" in update_data

    for field, value in update_data.items():
        setattr(job_posting, field, value)

    if requirements_changed:
        cache_service.delete_embeddings_by_texts(db, old_requirements)

    db.commit()
    db.refresh(job_posting)
    return job_posting


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_posting(job_id: UUID, db: Session = Depends(get_db)):
    """Delete a job posting"""
    job_posting = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job_posting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found"
        )

    db.delete(job_posting)
    db.commit()
    return None
