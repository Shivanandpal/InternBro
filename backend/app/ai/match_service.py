import json

from app.ai.gemini_service import GeminiService


class MatchService:

    @staticmethod
    def match_resume(resume_text, internship):

        prompt = f"""
You are an ATS recruitment AI.

Compare the resume with the internship.

Return ONLY valid JSON.

{{
"match_score":0,
"matching_skills":[],
"missing_skills":[],
"strengths":[],
"weaknesses":[],
"recommendations":[]
}}

Internship Title:
{internship.title}

Company:
{internship.company}

Description:
{internship.description}

Required Skills:
{internship.skills}

Resume:
{resume_text}
"""

        response = GeminiService.model.generate_content(prompt)

        text = response.text.strip()

        # Remove markdown if Gemini wraps JSON in ```json ... ```
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)