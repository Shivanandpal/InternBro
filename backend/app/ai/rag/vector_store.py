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
        
        # Pure-Python Euclidean distance (L2 norm)
        distances = []
        for idx, doc_emb in enumerate(self.embeddings):
            sum_sq = sum((x - y) ** 2 for x, y in zip(doc_emb, embedding))
            distances.append((sum_sq ** 0.5, idx))
            
        # Sort indices by distance ascending
        distances.sort(key=lambda x: x[0])
        
        return [
            self.documents[idx]
            for _, idx in distances[:k]
            if idx < len(self.documents)
        ]