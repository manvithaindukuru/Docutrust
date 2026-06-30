import os
import pickle
from typing import List, Dict

import faiss
import numpy as np

from .model_loader import get_embedding_model


class VectorStore:
    def __init__(self, persist_dir="./vectorstore"):
        self.persist_dir = persist_dir

        os.makedirs(self.persist_dir, exist_ok=True)

        self.index_path = os.path.join(self.persist_dir, "faiss.index")
        self.metadata_path = os.path.join(self.persist_dir, "metadata.pkl")

        self.dimension = 384
        self.index = None
        self.metadata = []

        self._load_or_create_index()

    # ---------------------------------------
    # LOAD / CREATE INDEX
    # ---------------------------------------
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

    # ---------------------------------------
    # FASTEMBED
    # ---------------------------------------
    def _encode(self, texts: List[str]):

        model = get_embedding_model()

        embeddings = list(model.embed(texts))

        embeddings = np.array(embeddings, dtype=np.float32)

        faiss.normalize_L2(embeddings)

        return embeddings

    # ---------------------------------------
    # ADD DOCUMENTS
    # ---------------------------------------
    def add_documents(self, chunks: List[Dict], filename: str):

        texts = [chunk["text"] for chunk in chunks]

        embeddings = self._encode(texts)

        start_id = len(self.metadata)

        self.index.add(embeddings)

        ids = []

        for i, chunk in enumerate(chunks):

            doc_id = start_id + i

            self.metadata.append({
                **chunk,
                "filename": filename,
                "doc_id": doc_id
            })

            ids.append(doc_id)

        self._save_index()

        return ids

    # ---------------------------------------
    # SEARCH
    # ---------------------------------------
    def search(self, query: str, top_k: int = 5):

        if self.index.ntotal == 0:
            return []

        query_embedding = self._encode([query])

        k = min(top_k, self.index.ntotal)

        scores, indices = self.index.search(query_embedding, k)

        results = []

        for score, idx in zip(scores[0], indices[0]):

            if idx == -1:
                continue

            item = self.metadata[idx].copy()

            item["score"] = float(score)

            results.append(item)

        return sorted(results, key=lambda x: x["score"], reverse=True)

    # ---------------------------------------
    # STATS
    # ---------------------------------------
    def get_document_count(self):

        return self.index.ntotal

    def list_documents(self):

        docs = {}

        for item in self.metadata:

            name = item["filename"]

            if name not in docs:

                docs[name] = {
                    "filename": name,
                    "chunks": 0,
                    "pages": set()
                }

            docs[name]["chunks"] += 1

            if item.get("page") is not None:
                docs[name]["pages"].add(item["page"])

        return [
            {
                "filename": d["filename"],
                "chunks": d["chunks"],
                "pages": max(d["pages"]) if d["pages"] else None
            }
            for d in docs.values()
        ]

    # ---------------------------------------
    # DELETE ONE DOCUMENT
    # ---------------------------------------
    def delete_document(self, filename):

        remaining = []

        texts = []

        for item in self.metadata:

            if item["filename"] != filename:

                remaining.append(item)

                texts.append(item["text"])

        if not remaining:

            self.clear_all()

            return True

        embeddings = self._encode(texts)

        self.index = faiss.IndexFlatIP(self.dimension)

        self.index.add(embeddings)

        self.metadata = remaining

        for i, item in enumerate(self.metadata):
            item["doc_id"] = i

        self._save_index()

        return True

    # ---------------------------------------
    # CLEAR
    # ---------------------------------------
    def clear_all(self):

        self.index = faiss.IndexFlatIP(self.dimension)

        self.metadata = []

        self._save_index()