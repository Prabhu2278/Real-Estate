from app.routers.auth import router as auth_router
from app.routers.properties import router as properties_router
from app.routers.favorites import router as favorites_router
from app.routers.enquiries import router as enquiries_router
from app.routers.visits import router as visits_router
from app.routers.owner import router as owner_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "properties_router",
    "favorites_router",
    "enquiries_router",
    "visits_router",
    "owner_router",
    "admin_router",
]
