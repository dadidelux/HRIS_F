"""
Profile management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.schemas.profile import (
    ProfileResponse,
    ProfileUpdate,
    ChangePasswordRequest,
    ChangePasswordResponse
)
from app.core.dependencies import get_current_user
from app.core.security import verify_password, get_password_hash

router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's profile
    Creates profile if it doesn't exist
    """
    # Check if profile exists
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    # Create profile if it doesn't exist
    if not profile:
        profile = Profile(
            user_id=current_user.id,
            bio=None,
            skills=[],
            phone=None,
            address=None,
            documents=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile
    """
    # Get or create profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    # Update fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.put("/password", response_model=ChangePasswordResponse)
def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    return ChangePasswordResponse(message="Password changed successfully")


@router.post("/documents")
def upload_document(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload document (placeholder for file upload)
    In a real implementation, this would handle file uploads
    """
    # TODO: Implement file upload with multipart/form-data
    # For now, return a placeholder response
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Document upload feature will be implemented in future update"
    )


@router.delete("/documents/{document_id}")
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document from user's profile
    """
    # Get profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    # Find and remove document
    documents = profile.documents or []
    updated_documents = [doc for doc in documents if doc.get('id') != document_id]

    if len(updated_documents) == len(documents):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    profile.documents = updated_documents
    db.commit()

    return {"message": "Document deleted successfully"}
