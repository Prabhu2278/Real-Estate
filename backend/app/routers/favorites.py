from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.favorite import FavoriteCreate, FavoriteResponse
from app.schemas.common import MessageResponse
from app.crud.crud_favorite import get_user_favorites, add_favorite, remove_favorite
from app.crud.crud_property import get_property_by_id

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("", response_model=List[FavoriteResponse])
def get_my_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favs = get_user_favorites(db, current_user.id)
    result = []
    for f in favs:
        f_resp = FavoriteResponse.model_validate(f)
        if f_resp.property:
            f_resp.property.is_favorite = True
        result.append(f_resp)
    return result

@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def save_favorite(
    fav_in: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = get_property_by_id(db, fav_in.property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        
    fav = add_favorite(db, current_user.id, fav_in.property_id)
    resp = FavoriteResponse.model_validate(fav)
    if resp.property:
        resp.property.is_favorite = True
    return resp

@router.delete("/{property_id}", response_model=MessageResponse)
def delete_favorite(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = remove_favorite(db, current_user.id, property_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property was not found in your saved favorites"
        )
    return MessageResponse(message="Property removed from favorites successfully")
