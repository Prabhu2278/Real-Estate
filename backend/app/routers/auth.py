from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate, PasswordChange
from app.schemas.common import MessageResponse
from app.crud.crud_user import get_user_by_email, create_user, authenticate_user, update_user
from app.core.security import create_access_token, verify_password, hash_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    user = create_user(db, user_in)
    access_token = create_access_token(user.id)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated"
        )
    access_token = create_access_token(user.id)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = update_user(db, current_user, user_in)
    return updated

@router.post("/change-password", response_model=MessageResponse)
def change_password(
    pwd_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(pwd_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match"
        )
    current_user.password_hash = hash_password(pwd_data.new_password)
    db.commit()
    return MessageResponse(message="Password successfully updated")

@router.post("/logout", response_model=MessageResponse)
def logout():
    return MessageResponse(message="Successfully logged out")
