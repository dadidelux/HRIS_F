"""
Embedding service using Gemini text-embedding-004
Lazy-initializes the Gemini client on first use.
"""
import logging
from typing import List, Optional

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "gemini-embedding-001"
BATCH_SIZE = 100  # Gemini supports batching up to 100 texts


class EmbeddingService:
    def __init__(self):
        self._client: Optional[genai.Client] = None

    @property
    def client(self) -> genai.Client:
        if self._client is None:
            if not settings.GEMINI_API_KEY:
                raise RuntimeError(
                    "GEMINI_API_KEY not configured. Set it in .env"
                )
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        return self._client

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Embed a list of texts using Gemini text-embedding-004.
        Processes in batches of BATCH_SIZE. Returns 768-dim float vectors.
        """
        if not texts:
            return []

        all_embeddings: List[List[float]] = []

        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i: i + BATCH_SIZE]
            try:
                result = self.client.models.embed_content(
                    model=EMBEDDING_MODEL,
                    contents=batch,
                )
                batch_embeddings = [e.values for e in result.embeddings]
                all_embeddings.extend(batch_embeddings)
            except Exception as e:
                logger.error(f"Gemini embedding error on batch starting at {i}: {e}")
                raise RuntimeError(f"Embedding API error: {e}")

        return all_embeddings


# Singleton instance
embedding_service = EmbeddingService()
