"""
EmbeddingCache Model - Stores Gemini text embeddings to avoid redundant API calls
"""
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.database import Base


class EmbeddingCache(Base):
    __tablename__ = "embedding_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA256 hex
    text = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=False)  # List[float], 768-dim from text-embedding-004
    entity_type = Column(String(50), nullable=False)  # "skill" | "requirement" | "generic"
    cached_at = Column(DateTime, default=datetime.utcnow, nullable=False)
