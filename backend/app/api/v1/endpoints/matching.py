"""
Candidate-Job matching endpoints (HR/Admin only).
"""
from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_hr_or_admin, get_db
from app.models.job_posting import JobPosting
from app.models.user import User, UserRole
from app.schemas.matching import (
    CacheDeleteResponse,
    CandidateMatchScore,
    JobMatchingResponse,
    PrecomputeResponse,
    RankedCandidate,
)
from app.services.matching.cache_service import cache_service
from app.services.matching.hybrid_matcher import compute_candidate_score

router = APIRouter()


def _get_job_or_404(db: Session, job_id: UUID) -> JobPosting:
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")
    return job


def _active_candidates(db: Session) -> List[User]:
    return (
        db.query(User)
        .options(joinedload(User.profile), joinedload(User.resume))
        .filter(User.role == UserRole.CANDIDATE, User.is_active == "true")
        .all()
    )


@router.get("/candidates/{job_id}", response_model=JobMatchingResponse)
def get_matching_candidates(
    job_id: UUID,
    min_score: float = Query(default=0.0, ge=0.0, le=100.0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_hr_or_admin),
):
    """Rank all active candidates against a job posting using hybrid matching."""
    job = _get_job_or_404(db, job_id)
    requirements: List[str] = job.requirements or []

    candidates = _active_candidates(db)
    ranked: List[RankedCandidate] = []

    for user in candidates:
        skills: List[str] = (user.profile.skills if user.profile else []) or []
        scores = compute_candidate_score(db, skills, requirements)

        if scores["total_score"] < min_score:
            continue

        ranked.append(
            RankedCandidate(
                user_id=user.id,
                full_name=user.full_name,
                email=user.email,
                skills=skills,
                has_resume=user.resume is not None,
                scores=CandidateMatchScore(**scores),
            )
        )

    ranked.sort(key=lambda c: c.scores.total_score, reverse=True)

    return JobMatchingResponse(
        job_id=job.id,
        job_title=job.job_title,
        requirements=requirements,
        total_candidates=len(ranked),
        ranked_candidates=ranked,
        computed_at=datetime.utcnow(),
    )


@router.post("/precompute/{job_id}", response_model=PrecomputeResponse)
def precompute_embeddings(
    job_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_hr_or_admin),
):
    """Pre-warm the embedding cache for a job's requirements and all candidate skills."""
    job = _get_job_or_404(db, job_id)
    requirements: List[str] = job.requirements or []

    candidates = _active_candidates(db)
    all_skills: List[str] = []
    for user in candidates:
        if user.profile and user.profile.skills:
            all_skills.extend(user.profile.skills)

    unique_skills = list(dict.fromkeys(all_skills))  # preserve order, deduplicate

    req_embeddings = cache_service.get_or_compute_embeddings(db, requirements, entity_type="requirement")
    skill_embeddings = cache_service.get_or_compute_embeddings(db, unique_skills, entity_type="skill")

    return PrecomputeResponse(
        job_id=job.id,
        candidates_processed=len(candidates),
        embeddings_cached=len(req_embeddings) + len(skill_embeddings),
        message=f"Cached {len(req_embeddings)} requirement and {len(skill_embeddings)} skill embeddings.",
    )


@router.delete("/cache/{job_id}", response_model=CacheDeleteResponse)
def clear_embedding_cache(
    job_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_hr_or_admin),
):
    """Delete cached embeddings for a job's requirements."""
    job = _get_job_or_404(db, job_id)
    requirements: List[str] = job.requirements or []

    deleted = cache_service.delete_embeddings_by_texts(db, requirements)

    return CacheDeleteResponse(
        job_id=job.id,
        entries_deleted=deleted,
        message=f"Deleted {deleted} cached embedding(s) for job '{job.job_title}'.",
    )
