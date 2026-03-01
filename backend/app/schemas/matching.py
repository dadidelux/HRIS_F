"""
Pydantic schemas for candidate-job matching endpoints
"""
from pydantic import BaseModel
from typing import List
from uuid import UUID
from datetime import datetime


class CandidateMatchScore(BaseModel):
    total_score: float      # 0-100 percentage
    semantic_score: float   # 0-1
    keyword_score: float    # 0-1


class RankedCandidate(BaseModel):
    user_id: UUID
    full_name: str
    email: str
    skills: List[str]
    has_resume: bool
    scores: CandidateMatchScore


class JobMatchingResponse(BaseModel):
    job_id: UUID
    job_title: str
    requirements: List[str]
    total_candidates: int
    ranked_candidates: List[RankedCandidate]
    computed_at: datetime


class PrecomputeResponse(BaseModel):
    job_id: UUID
    candidates_processed: int
    embeddings_cached: int
    message: str


class CacheDeleteResponse(BaseModel):
    job_id: UUID
    entries_deleted: int
    message: str
