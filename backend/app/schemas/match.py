from pydantic import BaseModel
from typing import List


class MatchResponse(BaseModel):

    match_score: int

    matching_skills: List[str]

    missing_skills: List[str]

    strengths: List[str]

    weaknesses: List[str]

    recommendations: List[str]