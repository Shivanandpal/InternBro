from dotenv import load_dotenv
import os
import google.generativeai as genai
load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY"),
    transport="rest"
)


model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

class GeminiService:
    model = model

    @staticmethod
    def analyze_resume(resume_text):

        prompt = f"""
You are an ATS Resume Expert.

Analyze this resume.

Give your answer in JSON.

Return

summary

skills

strengths

weaknesses

projects

experience_level

missing_skills

career_suggestions

Resume

{resume_text}
"""

        response = model.generate_content(prompt)

        return response.text