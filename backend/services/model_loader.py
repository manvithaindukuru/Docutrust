from functools import lru_cache
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Lazy-load model ONLY when first needed.
    Prevents Render startup OOM.
    """
    return SentenceTransformer(MODEL_NAME)