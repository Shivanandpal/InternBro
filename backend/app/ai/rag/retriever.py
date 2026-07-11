from app.repositories.internship_repository import InternshipRepository
from app.ai.rag.embedder import Embedder
from app.ai.rag.vector_store import VectorStore


class InternshipRetriever:

    def __init__(self, db):

        self.db = db

        self.store = VectorStore()

        internships = InternshipRepository.get_all(db)

        docs = []

        for internship in internships:

            docs.append(
                f"""
Title:
{internship.title}

Company:
{internship.company}

Skills:
{internship.skills}

Description:
{internship.description}
"""
            )

        embeddings = Embedder.encode(docs)

        self.store.add(
            embeddings,
            docs
        )

    def retrieve(self, question):

        embedding = Embedder.encode(
            [question]
        )[0]

        return self.store.search(
            embedding
        )