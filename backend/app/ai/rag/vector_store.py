import numpy as np


class VectorStore:

    def __init__(self):
        self.embeddings = []
        self.documents = []

    def add(self, embeddings, docs):
        self.embeddings.extend(embeddings)
        self.documents.extend(docs)

    def search(self, embedding, k=5):
        if not self.embeddings or not self.documents:
            return []
        
        # Compute L2 distances
        query_vec = np.array(embedding)
        store_vecs = np.array(self.embeddings)
        
        # Euclidean distance (L2 norm)
        distances = np.linalg.norm(store_vecs - query_vec, axis=1)
        
        # Sort indices by distance ascending
        sorted_indices = np.argsort(distances)
        
        return [
            self.documents[i]
            for i in sorted_indices[:k]
            if i < len(self.documents)
        ]