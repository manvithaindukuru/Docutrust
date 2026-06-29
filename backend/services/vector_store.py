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
        self._load_or_create_index()

    # -------------------------
    # INIT INDEX
    # -------------------------
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

    # -------------------------
    # EMBEDDINGS (LAZY MODEL)
    # -------------------------
    def _encode(self, texts: List[str]) -> np.ndarray:
        model = get_embedding_model()

        embeddings = model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        return np.array(embeddings, dtype=np.float32)

    # -------------------------
    # ADD DOCUMENTS
    # -------------------------
    def add_documents(self, chunks: List[Dict], filename: str) -> List[int]:
        texts = [c["text"] for c in chunks]
        embeddings = self._encode(texts)

        start_idx = len(self.metadata)
        self.index.add(embeddings)

        doc_ids = []

        for i, chunk in enumerate(chunks):
            doc_id = start_idx + i

            self.metadata.append({
                **chunk,
                "filename": filename,
                "doc_id": doc_id
            })

            doc_ids.append(doc_id)

        self._save_index()
        return doc_ids

    # -------------------------
    # SEARCH
    # -------------------------
    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        if self.index.ntotal == 0:
            return []

        query_embedding = self._encode([query])

        actual_k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(query_embedding, actual_k)

        results = []

        for score, idx in zip(scores[0], indices[0]):
            if idx != -1 and idx < len(self.metadata):
                item = self.metadata[idx].copy()
                item["score"] = float(score)
                results.append(item)

        return sorted(results, key=lambda x: x["score"], reverse=True)

    # -------------------------
    # DOCUMENT STATS
    # -------------------------
    def get_document_count(self) -> int:
        return self.index.ntotal if self.index else 0

    def list_documents(self) -> List[Dict]:
        seen = {}

        for m in self.metadata:
            fname = m.get("filename", "unknown")

            if fname not in seen:
                seen[fname] = {
                    "filename": fname,
                    "chunks": 0,
                    "pages": set()
                }

            seen[fname]["chunks"] += 1

            if m.get("page") is not None:
                seen[fname]["pages"].add(m["page"])

        return [
            {
                "filename": k,
                "chunks": v["chunks"],
                "pages": max(v["pages"]) if v["pages"] else None
            }
            for k, v in seen.items()
        ]

    # -------------------------
    # DELETE DOCUMENT
    # -------------------------
    def delete_document(self, filename: str) -> bool:
        keep_metadata = []
        keep_texts = []

        for m in self.metadata:
            if m.get("filename") != filename:
                keep_metadata.append(m)
                keep_texts.append(m["text"])

        if not keep_metadata:
            self.clear_all()
            return True

        embeddings = self._encode(keep_texts)

        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(embeddings)

        self.metadata = keep_metadata

        for i, m in enumerate(self.metadata):
            m["doc_id"] = i

        self._save_index()
        return True

    # -------------------------
    # CLEAR ALL
    # -------------------------
    def clear_all(self):
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []
        self._save_index()