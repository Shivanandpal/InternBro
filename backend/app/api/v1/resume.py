import os
import shutil
import uuid
import json
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException
)
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.roles import require_roles
from app.models.user import Role
from app.ai.resume_parser import ResumeParser
from app.ai.gemini_service import GeminiService

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


@router.post("/analyze")
def analyze_resume(
    file: UploadFile = File(...),
    job_title: str = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(Role.STUDENT))
):
    # Enforce premium limits
    if not current_user.premium:
        if current_user.free_resume_used >= 1:
            raise HTTPException(
                status_code=403,
                detail="Free resume analysis credits exhausted. Please upgrade to Premium."
            )

    allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed."
        )

    # Create upload directory if it doesn't exist
    upload_dir = "uploads/resumes"
    os.makedirs(upload_dir, exist_ok=True)

    # Generate unique filename
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    filepath = os.path.join(upload_dir, filename)

    # Save file temporarily
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Extract text
        resume_text = ResumeParser.extract_text(filepath)
        if not resume_text or len(resume_text.strip()) < 10:
            raise ValueError("Could not extract readable text from resume file.")

        # Fetch active internship listings from Express backend
        listings = []
        try:
            import requests
            res_jobs = requests.get("http://localhost:5000/api/jobs", timeout=5)
            if res_jobs.status_code == 200:
                listings = res_jobs.json()
        except Exception as err:
            print(f"DATABASE INFO: Failed to fetch listings from Express: {err}")

        # Format listings for Gemini prompt
        listings_text = ""
        if listings:
            listings_text = "\nAvailable Internship Listings:\n" + "\n".join([
                f"- ID: {job.get('id') or job.get('_id')}, Title: {job.get('title')}, Company: {job.get('company')}, Skills Required: {', '.join(job.get('skillsRequired', []))}, Location: {job.get('location')}"
                for job in listings
            ])

        # Analyze using Gemini
        prompt = f"""
        You are a professional recruiting manager and career expert. Analyze the following resume content:
        "{resume_text}"
        
        {listings_text if listings_text else 'Evaluate this resume for general entry-level internship opportunities in technology/design/product.'}
        
        Task:
        1. Evaluate the overlapping skills, projects, and experiences in the candidate's resume content.
        2. From the "Available Internship Listings" provided above, identify the single listing that is the BEST FIT for the candidate's background. If no listings are provided or match, evaluate for a general "Software Engineering Intern" role.
        3. Calculate a match percentage (0-100) specifically for that best-matching internship role.
        4. Recommend strengths, critical improvements, additional skills, and general feedback.
        
        Respond STRICTLY in JSON format with the following keys. Do not include any markdown fences or extra explanations. The response must be a single, valid JSON object matching this structure:
        {{
          "matchPercentage": 78,
          "bestFitJob": {{
            "id": "job_id_here",
            "title": "job_title_here",
            "company": "company_here"
          }},
          "strengths": ["string", "string"],
          "improvements": ["string", "string"],
          "recommendedSkills": ["string", "string"],
          "generalFeedback": "string"
        }}
        """

        response = GeminiService.model.generate_content(prompt)
        text = response.text.strip()

        # Remove markdown wraps
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        analysis_result = json.loads(text)

        # Increment credits if not premium
        if not current_user.premium:
            current_user.free_resume_used += 1
            db.commit()

        # Cleanup file
        try:
            os.remove(filepath)
        except Exception:
            pass

        return analysis_result

    except Exception as e:
        # Cleanup file in case of error
        try:
            os.remove(filepath)
        except Exception:
            pass
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze resume: {str(e)}"
        )