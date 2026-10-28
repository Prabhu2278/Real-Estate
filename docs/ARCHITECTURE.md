# Architecture & System Design Documentation

## 1. System Overview

The **RealEstate Rental & Property Sales Platform** is a full-stack, enterprise-grade marketplace designed to seamlessly connect property seekers (customers/renters/buyers), property owners/landlords, and platform administrators.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React Native Web)                  │
│  - Expo Router (typed file-based routing)                       │
│  - Responsive Views (Desktop, Tablet, Mobile)                   │
│  - Modular Components & Design System Tokens                   │
│  - Axios Client with JWT Interceptors                           │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON REST
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI / Python)                   │
│  - Modular Routers: Auth, Properties, Favorites, Enquiries,     │
│    Visits, Owner, Admin                                         │
│  - Pydantic Request/Response Validation                         │
│  - Role-Based Access Control (Customer, Owner, Admin)           │
│  - Password Hashing (bcrypt) & JWT Sessions                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │ SQLAlchemy 2.0 ORM
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL / SQLite)               │
│  - Primary: PostgreSQL (production & local)                     │
│  - Fallback: Local SQLite for friction-free out-of-box run     │
│  - Alembic Migrations                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (React Native Web)

### Framework & Libraries
- **React Native & Expo**: Multi-platform foundation delivering 100% responsive web output while keeping native mobile compatibility (iOS & Android).
- **Expo Router**: Modern file-based routing with layouts, modal routes, and dynamic route segments (`/properties/[id]`).
- **Styling Architecture**: Component-level `StyleSheet` strictly tied to the design system palette (`COLORS.primary`, `COLORS.secondary`, `COLORS.accent`, `COLORS.sidebarBg`, etc.).

### Navigation Hierarchy
- `/`: Landing Page (Home with search tabs, featured properties, categories, popular locations, benefits).
- `/properties`: Property Listing Page (dynamic filters, keyword search, price slider, sorting, grid/list view).
- `/properties/[id]`: Property Details Page (image gallery, specifications, amenities, contact owner card, visit scheduling modal).
- `/login`: Split-screen authentication with architectural hero and quick demo sign-in.
- `/register`: Multi-role registration (Customer vs Property Owner) with field validation.
- `/customer/*`: Customer Dashboard, Saved Properties (Favorites), My Enquiries, Scheduled Visits, Profile.
- `/owner/*`: Owner Dashboard, My Properties, Add Property (4-step stepper), Edit Property, Enquiries Inbox, Visit Management.
- `/admin/*`: Administrator Dashboard, Manage Users, Platform Properties, Listing Approvals, Analytics & Reports.

---

## 3. Backend Architecture (FastAPI & SQLAlchemy)

### Modular Directory Structure
- `app/core/`: Configuration settings and cryptographic security (bcrypt hashing, JWT creation & decoding).
- `app/database.py`: Resilient database session management with automatic PostgreSQL connection and local SQLite fallback.
- `app/models/`: Declarative SQLAlchemy models with foreign keys, cascading constraints, unique indexes, and decimal monetary types.
- `app/schemas/`: Pydantic V2 schemas for strict request/response data contracts.
- `app/crud/`: Encapsulated database operations.
- `app/routers/`: Grouped API endpoints with dependency-injected authentication and permission guards.
- `app/services/seed_data.py`: Automated realistic seed data generation with authentic property photography matching the UI/UX design.

---

## 4. Security & Access Control

1. **Role-Based Authorization**:
   - `get_current_user`: Validates JWT token from `Authorization: Bearer <token>`.
   - `get_current_owner`: Restricts property management to verified owners and admins.
   - `get_current_admin`: Restricts approvals, user deactivation, and platform metrics to administrators.
2. **Ownership Verification**:
   - Owners can only modify or delete listings they created.
   - Customers can only view and manage their own enquiries and favorites.
3. **Password Security**:
   - Passwords hashed using bcrypt with adaptive work factor salt rounds. Plaintext passwords are never stored or logged.
