from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.roles import require_roles
from app.models.user import Role

from app.ai.rag.chatbot import CareerAssistant

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
)

router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"]
)


@router.post(
    "/",
    response_model=ChatResponse
)
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            Role.STUDENT
        )
    )
):
    # Enforce premium limits
    if not current_user.premium:
        if current_user.free_chat_used >= 2:
            raise HTTPException(
                status_code=403,
                detail="Free chat credits exhausted. Please upgrade to Premium."
            )

    answer = CareerAssistant.ask(
        db,
        data.question
    )

    if not current_user.premium:
        current_user.free_chat_used += 1
        db.commit()

    return {
        "answer": answer
    }