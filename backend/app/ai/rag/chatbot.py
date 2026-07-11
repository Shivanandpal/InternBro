from app.ai.gemini_service import GeminiService
from app.ai.rag.retriever import InternshipRetriever


class CareerAssistant:

    @staticmethod
    def ask(db, question):

        retriever = InternshipRetriever(db)

        docs = retriever.retrieve(question)

        context = "\n\n".join(docs)

        prompt = f"""
You are InternBRO's AI Career Coach — a friendly, knowledgeable mentor helping students find internships, build career skills, and prepare for job applications.

You have access to the following internship listings currently available on the platform:

{context if context.strip() else "No internship listings are currently available in the platform database."}

Guidelines:
- If the student asks about internships available on the platform, refer to the listings above.
- If relevant listings exist, mention them specifically (title, company, required skills).
- If no listings match their query, honestly say none are available right now and offer general advice.
- For career advice, resume tips, interview prep, skill recommendations, or general questions — answer helpfully from your knowledge as a career expert.
- Keep answers concise, friendly, and actionable.
- Never say "I don't have information" for general career questions — always try to help.

Student's Question:

{question}
"""

        response = GeminiService.model.generate_content(
            prompt
        )

        return response.text