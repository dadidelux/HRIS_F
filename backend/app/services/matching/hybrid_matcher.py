"""
Hybrid matching algorithm: 70% semantic (Gemini embeddings) + 30% keyword
"""
import logging
from typing import List, Dict

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.services.matching.cache_service import cache_service

logger = logging.getLogger(__name__)


def _keyword_score(skills: List[str], requirements: List[str]) -> float:
    """
    For each requirement, check if any skill is a full or partial match.
    Full exact match = 1.0, substring match = 0.5. Average across requirements.
    """
    if not requirements:
        return 0.0

    skills_lower = [s.lower() for s in skills]
    req_scores: List[float] = []

    for req in requirements:
        req_lower = req.lower()
        score = 0.0
        for skill_lower in skills_lower:
            if skill_lower == req_lower:
                score = 1.0
                break
            elif skill_lower in req_lower or req_lower in skill_lower:
                score = max(score, 0.5)
        req_scores.append(score)

    return sum(req_scores) / len(req_scores)


def _semantic_score(
    skill_embeddings: List[List[float]],
    req_embeddings: List[List[float]],
) -> float:
    """
    Cosine similarity matrix → per-skill max similarity → mean.
    """
    if not skill_embeddings or not req_embeddings:
        return 0.0

    skills_matrix = np.array(skill_embeddings)   # (n_skills, 768)
    reqs_matrix = np.array(req_embeddings)        # (n_reqs, 768)

    sim_matrix = cosine_similarity(skills_matrix, reqs_matrix)  # (n_skills, n_reqs)
    max_sims_per_skill = sim_matrix.max(axis=1)                  # (n_skills,)
    return float(max_sims_per_skill.mean())


def compute_candidate_score(
    db,
    candidate_skills: List[str],
    job_requirements: List[str],
) -> Dict[str, float]:
    """
    Compute hybrid match score for one candidate against one job.
    Returns: { total_score (0-100), semantic_score (0-1), keyword_score (0-1) }
    """
    if not candidate_skills or not job_requirements:
        return {"total_score": 0.0, "semantic_score": 0.0, "keyword_score": 0.0}

    skill_embeddings = cache_service.get_or_compute_embeddings(
        db, candidate_skills, entity_type="skill"
    )
    req_embeddings = cache_service.get_or_compute_embeddings(
        db, job_requirements, entity_type="requirement"
    )

    sem = _semantic_score(skill_embeddings, req_embeddings)
    kw = _keyword_score(candidate_skills, job_requirements)
    total = 0.7 * sem + 0.3 * kw

    return {
        "total_score": round(total * 100, 1),
        "semantic_score": round(sem, 4),
        "keyword_score": round(kw, 4),
    }
