from functools import lru_cache
from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Lazy loads embedding model only when first needed.
    Cached globally for performance.
    """
    model = SentenceTransformer("all-MiniLM-L6-v2")
    return model