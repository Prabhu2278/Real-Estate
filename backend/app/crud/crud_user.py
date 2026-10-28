from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower().strip()).first()

def get_users(db: Session, skip: int = 0, limit: int = 50, role: Optional[str] = None, search: Optional[str] = None) -> List[User]:
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        search_filter = f"%{search}%"
        query = query.filter((User.full_name.ilike(search_filter)) | (User.email.ilike(search_filter)))
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

def count_users(db: Session, role: Optional[str] = None, search: Optional[str] = None) -> int:
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        search_filter = f"%{search}%"
        query = query.filter((User.full_name.ilike(search_filter)) | (User.email.ilike(search_filter)))
    return query.count()

def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hash_password(user_in.password),
        phone=user_in.phone.strip() if user_in.phone else None,
        role=user_in.role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
    if user_in.full_name is not None:
        user.full_name = user_in.full_name.strip()
    if user_in.phone is not None:
        user.phone = user_in.phone.strip()
    if user_in.avatar_url is not None:
        user.avatar_url = user_in.avatar_url
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
