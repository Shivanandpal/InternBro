from app.ai.resume_parser import ResumeParser
from app.ai.gemini_service import GeminiService

text = ResumeParser.extract_text(
    "uploads/resumes/resume.pdf"
)

response = GeminiService.analyze_resume(text)

print(response)