import os
import pickle
import numpy as np
from typing import List, Dict
import faiss

from .model_loader import get_embedding_model


class VectorStore:
    def __init__(self, persist_dir: str = "./vectorstore"):
        self.persist_dir = persist_dir
        self.index_path = os.path.join(persist_dir, "faiss.index")
        self.metadata_path = os.path.join(persist_dir, "metadata.pkl")

        self.dimension = 384
        self.index = None
        self.metadata: List[Dict] = []

        os.makedirs(persist_dir, exist_ok=True)

        # ❗ DO NOT load model here (this was causing OOM)
        self.model = None

        self._load_or_create_index()

    # ----------------------------
    # Lazy model loader
    # ----------------------------
    def _get_model(self):
        if self.model is None:
            self.model = get_embedding_model()
        return self.model

    # ----------------------------
    # Index loading
    # ----------------------------
    def _load_or_create_index(self):
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.metadata_path, "rb") as f:
                self.metadata = pickle.load(f)
        else:
            self.index = faiss.IndexFlatIP(self.dimension)
            self.metadata = []

    def _save_index(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "wb") as f:
            pickle.dump(self.metadata, f)

    # ----------------------------
    # Embedding (lazy model usage)
    # ----------------------------
    def _encode(self, texts: List[str]) -> np.ndarray:
        model = self._get_model()
        embeddings = model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False
        )
        return np.array(embeddings, dtype=np.float32)

    # ----------------------------
    # Add docs
    # ----------------------------
    def add_documents(self, chunks: List[Dict], filename: str):
        texts = [c["text"] for c in chunks]
        embeddings = self._encode(texts)

        start_idx = len(self.metadata)
        self.index.add(embeddings)

        for i, chunk in enumerate(chunks):
            self.metadata.append({
                **chunk,
                "doc_id": start_idx + i,
                "filename": filename
            })

        self._save_index()

    # ----------------------------
    # Search
    # ----------------------------
    def search(self, query: str, top_k: int = 5):
        if self.index.ntotal == 0:
            return []

        query_embedding = self._encode([query])

        k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(query_embedding, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if 0 <= idx < len(self.metadata):
                item = self.metadata[idx].copy()
                item["score"] = float(score)
                results.append(item)

        return sorted(results, key=lambda x: x["score"], reverse=True)

    # ----------------------------
    # Utility
    # ----------------------------
    def get_document_count(self):
        return self.index.ntotal if self.index else 0