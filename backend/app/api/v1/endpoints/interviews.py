"""
Interview management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.database import get_db
from app.models.user import User
from app.models.interview import Interview, InterviewStatus, InterviewType
from app.models.application import Application
from app.schemas.interview import (
    InterviewResponse,
    InterviewCreate,
    InterviewUpdate
)
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[InterviewResponse])
def list_interviews(
    filter_type: Optional[str] = None,  # "upcoming" or "completed"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List user's interviews
    Filter by upcoming or completed
    """
    # Get all interviews for user's applications
    query = db.query(Interview).join(Application).filter(
        Application.user_id == current_user.id
    )

    # Apply filter
    if filter_type == "upcoming":
        query = query.filter(
            Interview.status == InterviewStatus.SCHEDULED,
            Interview.interview_date >= date.today()
        )
    elif filter_type == "completed":
        query = query.filter(
            (Interview.status == InterviewStatus.COMPLETED) |
            (Interview.interview_date < date.today())
        )

    interviews = query.order_by(Interview.interview_date.desc(), Interview.interview_time.desc()).all()
    return interviews


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific interview by ID
    """
    interview = db.query(Interview).join(Application).filter(
        Interview.id == interview_id,
        Application.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )

    return interview


@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
    interview_data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Schedule a new interview
    (Typically called by HR/Admin, but allowing candidates for testing)
    """
    # Check if application exists
    application = db.query(Application).filter(
        Application.id == interview_data.application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Validate interview type
    try:
        interview_type = InterviewType(interview_data.interview_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid interview type"
        )

    # Create interview
    new_interview = Interview(
        application_id=interview_data.application_id,
        interview_date=interview_data.interview_date,
        interview_time=interview_data.interview_time,
        location=interview_data.location,
        interview_type=interview_type,
        status=InterviewStatus.SCHEDULED,
        notes=interview_data.notes,
        interviewer_name=interview_data.interviewer_name
    )

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    return new_interview


@router.put("/{interview_id}", response_model=InterviewResponse)
def update_interview(
    interview_id: str,
    interview_data: InterviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update/reschedule an interview
    """
    interview = db.query(Interview).join(Application).filter(
        Interview.id == interview_id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )

    # Update fields
    update_data = interview_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "status":
            try:
                value = InterviewStatus(value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid status value"
                )
        elif field == "interview_type" and value:
            try:
                value = InterviewType(value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid interview type"
                )

        setattr(interview, field, value)

    db.commit()
    db.refresh(interview)

    return interview


@router.delete("/{interview_id}")
def delete_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel an interview
    """
    interview = db.query(Interview).join(Application).filter(
        Interview.id == interview_id
    ).first()

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )

    # Mark as cancelled instead of deleting
    interview.status = InterviewStatus.CANCELLED
    db.commit()

    return {"message": "Interview cancelled successfully"}
