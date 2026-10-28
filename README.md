# RealEstate - Rental & Property Sales Platform

A modern, full-stack, enterprise-grade Real Estate Platform built with **React Native (Web)**, **Expo Router**, **Python (FastAPI)**, and **PostgreSQL**.

Designed and implemented in faithful adherence to the attached modern UI/UX design showcase reference.

---

## 📸 Key Features

- **Rent & Buy Marketplace**: Search and browse real estate with real-time filters by city, property type, price range, bedrooms, bathrooms, and furnishing.
- **Rich Property Details**: High-resolution image galleries, detailed specifications, amenities badges, and interactive map preview.
- **Customer Portal**:
  - Saved Properties (Favorites) with instant database persistence
  - Direct inquiry submission with property owners
  - In-person visit scheduling with calendar date picker and time slots
- **Owner Portal**:
  - Multi-step property listing wizard (Basic Info -> Details -> Location & Amenities -> Photos)
  - Manage listings with Active, Pending, Rented, Sold status toggles
  - Dedicated inbox for customer inquiries with direct replies
  - In-person visit request confirmation and coordination
- **Administrator Portal**:
  - Platform overview metrics (total users, listings, pending reviews, inquiries)
  - Property approval and rejection workflow with custom feedback reasons
  - User management (search, filter by role, activate/deactivate accounts)
  - Analytics and performance reports

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React Native with Expo SDK 58
- **Platform**: React Native Web (fully cross-platform for Android & iOS)
- **Navigation**: Expo Router (typed file-based routing)
- **Language**: TypeScript
- **Styling**: React Native StyleSheet with custom design system tokens matching the UI reference
- **HTTP Client**: Axios with JWT token interceptors

### Backend
- **Framework**: Python 3.13 + FastAPI
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic V2
- **Database**: PostgreSQL (with automated fallback to SQLite for immediate local execution)
- **Migrations**: Alembic
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Testing**: Pytest automated test suite (13/13 passing tests)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (or use the built-in automatic SQLite fallback)

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest tests -v

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- Backend API: `http://127.0.0.1:8000`
- Swagger UI Docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

*Note: On first startup, the database automatically initializes tables and seeds realistic properties (matching the reference design: Velachery, ECR, T. Nagar, Anna Nagar apartments and villas) and test accounts.*

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Typecheck
npx tsc --noEmit

# Start Expo Web
npm run web
```

- Web App: `http://localhost:8081`

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer** | `priya@example.com` | `customer123` | Customer Dashboard, Saved Properties, Enquiries, Visits |
| **Owner** | `ramesh@example.com` | `owner123` | Owner Dashboard, My Properties, Add Listing, Enquiries Inbox |
| **Administrator** | `admin@realestate.com` | `admin123` | Admin Dashboard, Listing Approvals, User Management |

---

## 🐳 Docker Deployment

To launch the complete application with PostgreSQL:

```bash
docker-compose up --build
```

---

## 📁 Documentation

Detailed documentation is available in the `docs/` folder:
- [Architecture & Design](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [Database Schema & ERD](docs/DATABASE.md)
- [Project Structure](PROJECT_STRUCTURE.md)
