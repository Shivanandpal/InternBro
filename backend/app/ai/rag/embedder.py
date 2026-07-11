import os
import google.generativeai as genai

# Configure genai with the key
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key, transport="rest")

class Embedder:

    @staticmethod
    def encode(texts):
        if not texts:
            return []
        try:
            response = genai.embed_content(
                model="models/embedding-001",
                content=texts,
                task_type="retrieval_document"
            )
            embeddings = response.get("embedding", [])
            return embeddings
        except Exception as e:
            print(f"GEMINI EMBEDDING ERROR: {e}. Returning fallback zero vectors.")
            # Fallback dimension size of 768 for text-embedding-004
            return [[0.0] * 768 for _ in texts]