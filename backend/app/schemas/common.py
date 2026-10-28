from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel

T = TypeVar("T")

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int

class DashboardStats(BaseModel):
    total_users: int = 0
    total_properties: int = 0
    active_listings: int = 0
    pending_approvals: int = 0
    total_enquiries: int = 0
    upcoming_visits: int = 0
    saved_properties: int = 0
