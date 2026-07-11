from app.ai.resume_parser import ResumeParser

text = ResumeParser.extract_text(
    "uploads/resumes/resume.pdf"
)

print(text)