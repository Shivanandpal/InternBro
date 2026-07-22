from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserUpdate
from app.models.user import User

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/{id}", response_model=UserResponse)
def get_user_by_id(id: str, db: Session = Depends(get_db)):
    user = UserRepository.get_by_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{id}", response_model=UserResponse)
def update_user_by_id(id: str, data: UserUpdate, db: Session = Depends(get_db)):
    user = UserRepository.get_by_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = data.dict(exclude_unset=True)
    if 'email' in update_data and update_data['email'] != user.email:
        existing = UserRepository.get_by_email(db, update_data['email'])
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user
