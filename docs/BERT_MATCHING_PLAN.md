# BERT-Based Hybrid Resume-Job Matching System

## Overview
Implement a **hybrid matching system** that combines sentence-BERT embeddings with keyword matching to rank candidates for job postings. HR users will see candidates ranked by match score.

## Specifications
- **Approach**: Hybrid (70% semantic embeddings + 30% keyword matching)
- **Scope**: Match user `skills` array → job `requirements` array
- **Feature**: Candidate ranking for HR (GET `/api/v1/matching/candidates/{job_id}`)
- **Deployment**: Local CPU inference using `all-MiniLM-L6-v2` model (~23MB)

---

## Implementation Tasks

### 1. Add ML Dependencies
**File**: `backend/requirements.txt`

Add:
```
sentence-transformers==2.3.1
torch==2.1.2  # CPU version
numpy>=1.24.0
scikit-learn>=1.3.0
```

### 2. Create Matching Service Module

**New Directory**: `backend/app/services/matching/`

| File | Purpose |
|------|---------|
| `__init__.py` | Module init |
| `embedding_service.py` | Singleton for BERT model, lazy loading, batch encoding |
| `hybrid_matcher.py` | Combines semantic + keyword scores |
| `cache_service.py` | Database-backed embedding cache |

**Key Algorithm** (hybrid_matcher.py):
```
total_score = 0.7 * semantic_score + 0.3 * keyword_score

semantic_score:
  - Encode skills & requirements as 384-dim vectors
  - Compute cosine similarity matrix
  - Average of max similarities per skill

keyword_score:
  - Exact match: full points
  - Partial/substring match: half points
  - Normalize by requirement count
```

### 3. Create Embedding Cache Model
**New File**: `backend/app/models/embedding_cache.py`

```python
class EmbeddingCache(Base):
    __tablename__ = "embedding_cache"
    id: UUID
    entity_type: str  # 'job_requirement' | 'user_skill'
    entity_id: UUID
    text_hash: str  # SHA256 for change detection
    embedding: ARRAY(Float)  # 384 dimensions
```

### 4. Create Database Migration
**New File**: `backend/alembic/versions/XXX_add_embedding_cache.py`

Creates `embedding_cache` table with indexes on `entity_type`, `entity_id`, and `text_hash`.

### 5. Create Matching Schemas
**New File**: `backend/app/schemas/matching.py`

- `CandidateMatchScore`: total_score, semantic_score, keyword_score, matched_skills
- `RankedCandidate`: candidate info + match score + application status
- `JobMatchingResponse`: job_id, job_title, ranked_candidates list

### 6. Create Matching API Endpoint
**New File**: `backend/app/api/v1/endpoints/matching.py`

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/matching/candidates/{job_id}` | GET | HR/Admin | Get ranked candidates for a job |
| `/matching/precompute/{job_id}` | POST | HR/Admin | Pre-cache job embeddings |
| `/matching/cache/{job_id}` | DELETE | HR/Admin | Invalidate job cache |

**Query Parameters**:
- `min_score`: Filter by minimum score (0-100)
- `limit`: Max candidates (default 50)
- `include_applied`: Include already-applied candidates
- `semantic_weight`: Adjust algorithm weight (default 0.7)

### 7. Register Router
**Modify**: `backend/app/api/v1/api.py`

```python
from app.api.v1.endpoints import matching
api_router.include_router(matching.router, prefix="/matching", tags=["matching"])
```

### 8. Hook Cache Invalidation
**Modify**: `backend/app/api/v1/endpoints/job_postings.py`

When job requirements are updated, invalidate embedding cache.

---

## Files to Create
1. `backend/app/services/__init__.py`
2. `backend/app/services/matching/__init__.py`
3. `backend/app/services/matching/embedding_service.py`
4. `backend/app/services/matching/hybrid_matcher.py`
5. `backend/app/services/matching/cache_service.py`
6. `backend/app/models/embedding_cache.py`
7. `backend/app/schemas/matching.py`
8. `backend/app/api/v1/endpoints/matching.py`
9. `backend/alembic/versions/XXX_add_embedding_cache.py`

## Files to Modify
1. `backend/requirements.txt` - Add ML dependencies
2. `backend/app/api/v1/api.py` - Register matching router
3. `backend/app/models/__init__.py` - Export EmbeddingCache
4. `backend/app/api/v1/endpoints/job_postings.py` - Add cache invalidation hook

## Existing Patterns to Reuse
- **Role check**: `backend/app/core/dependencies.py` - `get_current_active_admin` pattern
- **Router structure**: `backend/app/api/v1/endpoints/applications.py` - CRUD pattern
- **Model structure**: `backend/app/models/profile.py` - JSON column, UUID, timestamps
- **Schema pattern**: `backend/app/schemas/user.py` - Pydantic v2 with `Config`

---

## Performance Estimates (CPU)
- Model loading: ~3-5 seconds (first request only, lazy loaded)
- Single embedding: ~10-20ms
- Batch of 32 texts: ~100-200ms
- **100 candidates ranking: ~2-5 seconds**

---

## Verification Plan

1. **Install dependencies**: `pip install -r requirements.txt`
2. **Run migration**: `alembic upgrade head`
3. **Test embedding service**:
   ```python
   from app.services.matching.embedding_service import get_embedding_service
   svc = get_embedding_service()
   emb = svc.encode(["Python", "FastAPI"])
   assert emb.shape == (2, 384)
   ```
4. **Test API endpoint**:
   ```bash
   # As HR user
   curl -H "Authorization: Bearer $HR_TOKEN" \
     http://localhost:8000/api/v1/matching/candidates/{job_id}
   ```
5. **Verify response**: Candidates sorted by `total_score` descending
6. **Run existing tests**: `pytest` to ensure no regressions
