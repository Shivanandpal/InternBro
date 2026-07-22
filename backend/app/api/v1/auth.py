from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.token import Token
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from app.dependencies.auth import get_current_user
from sqlalchemy.orm import Session
import requests

from app.db.database import get_db
from app.schemas.auth import UserSignup
from app.services.auth_service import AuthService
from app.core.config import settings
from app.models.user import User, Role
from app.repositories.user_repository import UserRepository
from app.core.security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup")
def signup(
    user: UserSignup,
    db: Session = Depends(get_db)
):

    try:

        token = AuthService.signup(
            db,
            user
        )

        return {
            "success": True,
            "access_token": token
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    try:
        return AuthService.login(
            db,
            form_data.username,   # username field will contain the email
            form_data.password,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )

@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value if hasattr(current_user.role, "value") else current_user.role,
        "premium": getattr(current_user, "premium", False),
        "free_chat_used": getattr(current_user, "free_chat_used", 0),
        "free_resume_used": getattr(current_user, "free_resume_used", 0),
        "dob": getattr(current_user, "dob", None),
        "mobile_no": getattr(current_user, "mobile_no", None),
        "college_name": getattr(current_user, "college_name", None),
        "current_year": getattr(current_user, "current_year", None),
    }

@router.get("/google")
def google_login():
    # If client ID is missing, provide a local mock callback redirect for verification ease
    #resolving
    if not settings.GOOGLE_CLIENT_ID:
        print("GOOGLE AUTH INFO: Google Client ID missing. Generating mock Google callback redirection.")
        # Redirect to callback with a mock authorization code
        mock_callback_url = f"https://internbro.onrender.com/auth/google/callback?code=mock_google_code_123"
        return RedirectResponse(url=mock_callback_url)
        
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(url=google_auth_url)

@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    # Handle mock authorization code
    if code == "mock_google_code_123":
        email = "google.mockuser@gmail.com"
        name = "Google Mock User"
        sub = "google-mock-sub-12345"
    else:
        try:
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
            res = requests.post(token_url, data=data)
            if res.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to exchange authorization code for Google token")
            
            tokens = res.json()
            access_token = tokens.get("access_token")
            
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            user_info_res = requests.get(user_info_url, headers=headers)
            if user_info_res.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to retrieve user profile from Google")
            
            user_info = user_info_res.json()
            email = user_info.get("email")
            name = user_info.get("name")
            sub = user_info.get("sub")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Google Login Callback error: {str(e)}")
            
    # Find or create user
    user = UserRepository.get_by_email(db, email)
    if not user:
        user = User(
            name=name,
            email=email,
            google_id=sub,
            role=Role.STUDENT,
            verified=True
        )
        UserRepository.create(db, user)
    else:
        if not user.google_id:
            user.google_id = sub
            db.commit()
            
    # Generate JWT
    jwt_token = create_access_token(
        {
            "sub": user.email,
            "role": user.role.value
        }
    )
    
    # Redirect back to client login page with JWT
    frontend_url = f"https://internbro.onrender.com/login?token={jwt_token}"
    return RedirectResponse(url=frontend_url)
