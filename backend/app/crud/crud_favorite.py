from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.favorite import Favorite

def get_user_favorites(db: Session, user_id: int) -> List[Favorite]:
    return db.query(Favorite).filter(Favorite.user_id == user_id).order_by(Favorite.created_at.desc()).all()

def is_property_favorited(db: Session, user_id: int, property_id: int) -> bool:
    return db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.property_id == property_id).first() is not None

def add_favorite(db: Session, user_id: int, property_id: int) -> Favorite:
    existing = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.property_id == property_id).first()
    if existing:
        return existing
    fav = Favorite(user_id=user_id, property_id=property_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav

def remove_favorite(db: Session, user_id: int, property_id: int) -> bool:
    fav = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.property_id == property_id).first()
    if fav:
        db.delete(fav)
        db.commit()
        return True
    return False

def count_user_favorites(db: Session, user_id: int) -> int:
    return db.query(Favorite).filter(Favorite.user_id == user_id).count()
