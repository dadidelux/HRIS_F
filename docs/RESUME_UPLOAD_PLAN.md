# Resume Upload & Parsing System

## Overview
Implement a **resume upload system** that:
1. Accepts PDF uploads from candidates
2. Extracts text using `pypdf`
3. Parses structured data using **Gemini API** (gemini-2.5-flash)
4. Auto-populates extracted skills to user's profile

## Specifications
- **File Storage**: PostgreSQL BYTEA (binary in `resumes` table)
- **Parsing**: Synchronous on upload (~3-5 seconds)
- **Skill Sync**: Auto-populate to profile `skills` array
- **AI Model**: Gemini 2.5 Flash (same as resume_builder project)

---

## Implementation Tasks

### 1. Add Dependencies
**File**: `backend/requirements.txt`

```
google-genai==1.0.0
pypdf==4.0.1
```

### 2. Update Configuration
**File**: `backend/app/core/config.py`

Add:
```python
GEMINI_API_KEY: str = ""
MAX_RESUME_SIZE_MB: int = 10
ALLOWED_RESUME_TYPES: List[str] = ["application/pdf"]
```

### 3. Create Resume Model
**New File**: `backend/app/models/resume.py`

```python
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"))

    # File storage
    filename = Column(String(255))
    file_data = Column(LargeBinary)  # PDF binary (BYTEA)
    file_size = Column(Integer)

    # Parsed content
    extracted_text = Column(Text)      # Raw text from pypdf
    parsed_data = Column(JSON)         # Structured JSON from Gemini

    # Status
    parsing_status = Column(Enum)      # pending | completed | failed
    parsing_error = Column(Text)

    # Timestamps
    uploaded_at, parsed_at, updated_at
```

### 4. Create Database Migration
**New File**: `backend/alembic/versions/002_add_resumes_table.py`

Creates `resumes` table with:
- BYTEA for PDF storage
- JSON for parsed data
- Enum for parsing status
- Index on user_id

### 5. Create Resume Parser Service
**New File**: `backend/app/services/resume_parser.py`

Adapts logic from `resume_builder/src/gemini_pipeline.py`:

```python
from google import genai
from pypdf import PdfReader

class ResumeParserService:
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Use pypdf to extract text"""
        reader = PdfReader(BytesIO(pdf_bytes))
        return "".join(page.extract_text() for page in reader.pages)

    def parse_with_gemini(self, text: str) -> dict:
        """Send to Gemini API with structured prompt"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{SYSTEM_PROMPT}\n\nRESUME TEXT:\n{text}"
        )
        return json.loads(response.text)

    def extract_skills(self, parsed_data: dict) -> List[str]:
        """Get skills list from parsed data"""
        return parsed_data.get("skills", [])
```

### 6. Create Resume Schemas
**New File**: `backend/app/schemas/resume.py`

- `ResumeUploadResponse`: id, filename, parsing_status, skills_added
- `ResumeResponse`: Full resume data with parsed content
- `ParsedResumeData`: contact, experience, education, skills, etc.

### 7. Create Resume Endpoints
**Modify**: `backend/app/api/v1/endpoints/profile.py`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/profile/resume` | POST | Upload PDF, parse, sync skills |
| `/profile/resume` | GET | Get resume metadata + parsed data |
| `/profile/resume/download` | GET | Download original PDF |
| `/profile/resume` | DELETE | Delete resume |

### 8. Update User Model
**Modify**: `backend/app/models/user.py`

Add relationship:
```python
resume = relationship("Resume", back_populates="user", uselist=False)
```

---

## Files to Create
1. `backend/app/models/resume.py`
2. `backend/app/schemas/resume.py`
3. `backend/app/services/__init__.py`
4. `backend/app/services/resume_parser.py`
5. `backend/alembic/versions/002_add_resumes_table.py`

## Files to Modify
1. `backend/requirements.txt` - Add google-genai, pypdf
2. `backend/app/core/config.py` - Add GEMINI_API_KEY setting
3. `backend/app/models/user.py` - Add resume relationship
4. `backend/app/models/__init__.py` - Export Resume
5. `backend/app/api/v1/endpoints/profile.py` - Add resume endpoints
6. `backend/.env` - Add GEMINI_API_KEY value

## Existing Patterns to Reuse
- **File**: `backend/app/api/v1/endpoints/profile.py` - Existing profile endpoints pattern
- **File**: `backend/app/models/profile.py` - Model with JSON columns
- **File**: `backend/alembic/versions/001_initial_schema.py` - Migration pattern

---

## Data Flow

```
PDF Upload
    │
    ▼
┌─────────────────┐
│ Validate File   │ (type=PDF, size<10MB)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ pypdf Extract   │ → extracted_text
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini API      │ → parsed_data JSON
│ (2.5-flash)     │   { skills, experience, education... }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store in DB     │ → resumes table (file + parsed data)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sync Skills     │ → profile.skills array updated
└─────────────────┘
```

---

## Gemini Prompt (from resume_builder)

```
You are an expert HR Data Analyst. Extract all information from the provided CV text
into a clean, structured JSON format. Ensure you capture:
- Contact Information
- Professional Summary
- Work Experience (Company, Title, Dates, Responsibilities)
- Education (Institution, Degree, Dates)
- Skills (Technical and Soft Skills)
- Certifications
```

---

## Error Handling

| Error | Behavior |
|-------|----------|
| Invalid file type | HTTP 400 |
| File too large | HTTP 400 |
| PDF extraction fails | Store file, mark status=FAILED |
| Gemini API fails | Store file + text, mark status=FAILED |
| JSON parse error | Store file + text, mark status=FAILED |

---

## Environment Variables

Add to `.env`:
```
GEMINI_API_KEY=your-gemini-api-key
```

---

## Connection to BERT Matching System

This Resume Upload system is **Phase 1** of a two-part feature. It feeds directly into the **BERT Matching System** documented in `docs/BERT_MATCHING_PLAN.md`.

### How They Connect

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: Resume Upload (THIS PLAN)                            │
│  ─────────────────────────────────                             │
│  PDF → pypdf → Gemini → profile.skills[]                       │
│                              │                                  │
│                              ▼                                  │
│  PHASE 2: BERT Matching (docs/BERT_MATCHING_PLAN.md)           │
│  ──────────────────────────────────────────────────            │
│  profile.skills[] ──→ Sentence-BERT ──→ Match Score            │
│  job.requirements[] ─┘   Embeddings      (0-100)               │
│                                              │                  │
│                                              ▼                  │
│  HR Dashboard: Ranked Candidates for Job Posting               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Order

| Phase | Feature | Purpose |
|-------|---------|---------|
| **1** | Resume Upload (this plan) | Populate `profile.skills` automatically |
| **2** | BERT Matching | Use skills for candidate-job matching |

### Shared Dependencies

Both systems need to be in `requirements.txt`:
```
# Phase 1: Resume Upload
google-genai==1.0.0
pypdf==4.0.1

# Phase 2: BERT Matching (from docs/BERT_MATCHING_PLAN.md)
sentence-transformers==2.3.1
torch==2.1.2
numpy>=1.24.0
scikit-learn>=1.3.0
```

### Data Flow Integration

**Resume Upload populates:**
```python
profile.skills = ["Python", "FastAPI", "PostgreSQL", "Docker", ...]
```

**BERT Matching uses:**
```python
# Match profile.skills against job_posting.requirements
match_score = hybrid_matcher.compute_match_score(
    user_skills=profile.skills,      # ← From resume upload
    job_requirements=job.requirements
)
```

---

## Verification Plan

1. **Install dependencies**: `pip install -r requirements.txt`
2. **Set env var**: Add `GEMINI_API_KEY` to `.env`
3. **Run migration**: `alembic upgrade head`
4. **Test upload**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/profile/resume \
     -H "Authorization: Bearer $TOKEN" \
     -F "file=@resume.pdf"
   ```
5. **Verify response**: Check `parsing_status=completed` and `skills_added` list
6. **Check profile**: GET `/api/v1/profile` should show new skills
7. **Test download**: GET `/api/v1/profile/resume/download` returns PDF
8. **Future (Phase 2)**: Skills will feed into BERT matching for HR candidate ranking
