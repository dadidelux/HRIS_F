"""
DB-backed embedding cache using SHA256 text hashes.
Stateless: receives db: Session on each call to match existing endpoint patterns.
"""
import hashlib
import logging
from typing import List, Optional
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.embedding_cache import EmbeddingCache
from app.services.matching.embedding_service import embedding_service

logger = logging.getLogger(__name__)


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class CacheService:
    def get_cached_embedding(self, db: Session, text: str) -> Optional[List[float]]:
        """Return cached embedding if it exists, else None."""
        text_hash = _sha256(text)
        entry = db.query(EmbeddingCache).filter(
            EmbeddingCache.text_hash == text_hash
        ).first()
        return entry.embedding if entry else None

    def set_cached_embedding(
        self,
        db: Session,
        text: str,
        embedding: List[float],
        entity_type: str = "generic",
    ) -> None:
        """Persist an embedding to the cache (upsert)."""
        text_hash = _sha256(text)
        existing = db.query(EmbeddingCache).filter(
            EmbeddingCache.text_hash == text_hash
        ).first()
        if existing:
            existing.embedding = embedding
            existing.cached_at = datetime.utcnow()
        else:
            db.add(EmbeddingCache(
                text_hash=text_hash,
                text=text,
                embedding=embedding,
                entity_type=entity_type,
                cached_at=datetime.utcnow(),
            ))
        db.commit()

    def get_or_compute_embeddings(
        self,
        db: Session,
        texts: List[str],
        entity_type: str = "generic",
    ) -> List[List[float]]:
        """
        For each text: check cache first. Batch-call Gemini only for cache misses.
        Returns embeddings in the same order as input texts.
        """
        results: List[Optional[List[float]]] = [None] * len(texts)
        miss_indices: List[int] = []
        miss_texts: List[str] = []

        for i, text in enumerate(texts):
            cached = self.get_cached_embedding(db, text)
            if cached is not None:
                results[i] = cached
            else:
                miss_indices.append(i)
                miss_texts.append(text)

        if miss_texts:
            new_embeddings = embedding_service.embed_texts(miss_texts)
            for orig_index, text, embedding in zip(miss_indices, miss_texts, new_embeddings):
                self.set_cached_embedding(db, text, embedding, entity_type)
                results[orig_index] = embedding

        return results  # type: ignore[return-value]

    def delete_embeddings_by_texts(self, db: Session, texts: List[str]) -> int:
        """Delete cached embeddings for specific texts. Returns rows deleted."""
        if not texts:
            return 0
        hashes = [_sha256(t) for t in texts]
        deleted = db.query(EmbeddingCache).filter(
            EmbeddingCache.text_hash.in_(hashes)
        ).delete(synchronize_session=False)
        db.commit()
        return deleted


# Singleton instance
cache_service = CacheService()
