# CivicPulse 🏛️⚡ — AI-Powered Municipal Issue Management & Prioritization Platform

> **A centralized civic intelligence platform that leverages machine learning to classify complaints in real-time, detect duplicate reports via cosine similarity, compute transparent urgency scores, and visualize geographical hotspots through interactive Leaflet maps and Amazon-style dashboards.**

---

## 🌟 Key Highlights & Amazon-Inspired Experience

CivicPulse is styled with a familiar, high-conversion **Amazon e-commerce aesthetic**, engineered to give citizens and municipal authorities distinct, role-tailored workflows:

- **Separate Login Portals**:
  - 👤 **Citizen Portal (`/login`)**: Amazon-styled clean sign-in and registration for citizens to file reports, track status timelines, and endorse community issues.
  - 🏛️ **Municipal Official Portal (`/official/login`)**: Amazon Seller / AWS Console-styled secure terminal for city authorities, department leads, and field dispatch engineers.
- **Amazon Header Navigation (`AmazonNavbar`)**:
  - Deliver-To / Ward Selector (`Central Zone 110001`)
  - Amazon-style Category dropdown with yellow search button
  - "Returns & Reports" (Amazon "Returns & Orders" equivalent)
  - Quick "Report Issue" action button (Amazon Cart equivalent)
- **Amazon Order-Style Tracking Stepper (`AmazonTrackingStepper`)**:
  - Real-time milestone tracking: `Reported` ➔ `AI Review & Triage` ➔ `Assigned to Dept` ➔ `Work In Progress` ➔ `Resolved & Closed`
- **Faceted Amazon Filter Sidebar**:
  - Filter by lifecycle status, civic priority tier, and municipal ward.
- **Amazon "Buy Box" Action Console**:
  - Citizen endorsement upvote counter, dynamic SLA target, and municipal dispatch controls.

---

## 🧠 AI / ML Engine Architecture

CivicPulse includes a production-ready machine learning pipeline using `scikit-learn`:

### 1. Real-Time Category Classification
- Converts complaint text (title + description) into high-dimensional n-gram features via `TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)`.
- Classifies complaints across **6 municipal categories** using a calibrated `LogisticRegression` model:
  1. `Roads & Potholes` ➔ *Roads & Infrastructure*
  2. `Waste Management & Garbage` ➔ *Sanitation & Solid Waste*
  3. `Water Supply & Leakage` ➔ *Water Works & Supply*
  4. `Drainage & Sewage` ➔ *Sewage & Stormwater Drainage*
  5. `Streetlights & Electricity` ➔ *Electrical & Public Lighting*
  6. `Public Health & Sanitation` ➔ *Public Health & Pest Control*
- The model trains automatically on initial launch and serializes artifacts to `backend/ml_models/`.

### 2. Duplicate Complaint Radar (Cosine Similarity)
- When a citizen or official inputs a complaint, CivicPulse extracts TF-IDF vectors and computes **Cosine Similarity** against all active complaints in the city.
- Incorporates **Haversine geographic proximity weighting** (complaints within 400m receive an automated similarity boost).
- If similarity exceeds 40%, the citizen is alerted before submitting so they can endorse the existing issue rather than creating duplicate overhead.
- Municipal officials can **one-click merge duplicate complaints** in the Official Dashboard, which consolidates citizen reports and boosts the primary ticket's civic priority score.

### 3. Transparent & Explainable Priority Scoring Formula
Unlike black-box models, CivicPulse calculates a dynamic **0 to 100 Priority Score** with a fully transparent mathematical breakdown:

$$\text{Priority Score} = \text{Keyword Urgency (0-35)} + \text{Category Baseline (15-26)} + \text{Duplicate Volume (0-20)} + \text{SLA Aging (0-15)} + \text{Citizen Upvotes (0-10)}$$

| Component | Points | Rationale |
| :--- | :--- | :--- |
| **Urgency Keywords** | 0 – 35 pts | Detects safety hazards ("open manhole", "live wire", "sparking", "sinkhole", "flooding", "toxic", "burst pipe"). |
| **Category Baseline** | 15 – 26 pts | Inherent infrastructure severity (Drainage & Sewage: 26, Water Supply: 24, Streetlights: 22, Roads: 18, Waste: 15). |
| **Duplicate / Volume** | 0 – 20 pts | Recurring hotspots reported by multiple citizens scale priority (+5 pts per report up to +20). |
| **SLA Aging Delay** | 0 – 15 pts | Issues pending > 2 days (+5), > 5 days (+10), or > 10 days (+15) escalate dynamically. |
| **Citizen Endorsements** | 0 – 10 pts | Verified citizen upvotes validate community impact (+2 pts per endorsement). |

**Priority Tiers**:
- 🔴 **CRITICAL** (75 – 100 pts): Immediate field crew dispatch.
- 🟠 **HIGH** (55 – 74 pts): 24-48 hour resolution SLA.
- 🟡 **MEDIUM** (35 – 54 pts): Standard scheduled maintenance.
- 🟢 **LOW** (< 35 pts): Non-hazardous / routine cleanup.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, Recharts (analytics), Leaflet + OpenStreetMap (GIS Hotspots & coordinate picker).
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic, Scikit-learn, NumPy, Joblib, PyJWT, Bcrypt.
- **Database**: SQLite (default zero-config) or PostgreSQL (configured via `DATABASE_URL` environment variable).
- **Deployment**: Render (unified Web Service or Docker) + Vercel (standalone React frontend).

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Set Up Backend
```bash
# Clone the repository
git clone https://github.com/your-username/CivicPulse.git
cd CivicPulse

# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

# Install Python backend dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn backend.app.main:app --reload --port 8000
```
Backend will be available at: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)

### 2. Set Up & Run Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

## 🔑 Demo Credentials (1-Click Login Ready)

Both login pages include **1-Click Demo Login** buttons for instant evaluator access:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@civicpulse.org` | `Password123!` | File complaints, track reports, upvote community issues. |
| **Municipal Official** | `official@civicpulse.org` | `Password123!` | Dispatch console, update status, assign officers, merge duplicates, view analytics. |

---

## ☁️ Deployment Guide

CivicPulse is configured for **two deployment paths**:

### Option A: Unified Fullstack on Render (Recommended — Simplest 1-Click Setup)
Render serves both the React frontend and FastAPI backend from a single web service.

1. Push your repository to **GitHub** or **GitLab**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Web Service**.
4. Select your `CivicPulse` repository.
5. Configure the service settings:
   - **Name**: `civicpulse-app`
   - **Runtime**: `Python`
   - **Build Command**: `bash build.sh`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `ENVIRONMENT`: `production`
   - `SECRET_KEY`: *(Generate a secure random string or let Render create one)*
7. Click **Create Web Service**. Render will execute `build.sh` (which builds the React frontend and initializes database & ML models) and launch Uvicorn.

*Alternative*: You can also deploy via Render Blueprint by simply connecting the included `render.yaml` file!

---

### Option B: Decoupled (Vercel Frontend + Render Backend)

#### 1. Deploy Backend on Render:
- Create a Python Web Service on Render with root directory as `.`.
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- Note your backend URL (e.g., `https://civicpulse-api.onrender.com`).

#### 2. Deploy Frontend on Vercel:
- Import repository on [Vercel](https://vercel.com).
- Set **Root Directory** to `frontend`.
- Set Environment Variable:
  - `VITE_API_URL`: `https://civicpulse-api.onrender.com`
- Click **Deploy**. Vercel will build the frontend with `vercel.json` SPA client-side routing.

---

## 🗺️ Interactive GIS Hotspots & Analytics

- **Leaflet OpenStreetMap**:
  - Dynamic circle markers color-coded by urgency (`CRITICAL` = Red ring, `HIGH` = Orange, `MEDIUM` = Amber, `LOW` = Green).
  - Click on any pin to view details and jump to the tracking page.
  - Location picker with coordinate detection and GPS auto-pinning.
- **Recharts Analytics**:
  - Category frequency distribution.
  - Lifecycle pipeline status (Submitted vs Assigned vs In Progress vs Resolved).
  - 7-day intake vs resolution velocity area charts.

---

## 📂 Project Structure

```
LoacalNexus/
├── backend/
│   ├── app/
│   │   ├── config.py             # Settings, DB URL, CORS, Port
│   │   ├── database.py           # SQLAlchemy SQLite/Postgres engine
│   │   ├── models.py             # User, Complaint, Upvote, ActivityLog
│   │   ├── schemas.py            # Pydantic request & response validation
│   │   ├── auth.py               # Bcrypt password hashing & JWT auth
│   │   ├── ml_service.py         # TF-IDF + LogisticRegression + Cosine similarity + Priority engine
│   │   ├── seed_data.py          # Rich municipal seed data & demo accounts
│   │   ├── main.py               # FastAPI app, static mounting for unified Render deploy
│   │   └── routes/
│   │       ├── auth_routes.py    # Citizen & Official auth endpoints
│   │       ├── complaint_routes.py # CRUD, predict, check-duplicates, upvote, status, merge
│   │       └── analytics_routes.py # KPI overview & GIS hotspot data
│   ├── ml_models/                # Persisted ML model artifacts (.joblib)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # API integration client
│   │   ├── context/AuthContext.jsx # Citizen & Official session management
│   │   ├── components/
│   │   │   ├── AmazonNavbar.jsx  # Amazon top header navigation
│   │   │   ├── AmazonCategoryBar.jsx # Amazon category subnav
│   │   │   ├── ComplaintCard.jsx # Amazon product-style incident card
│   │   │   ├── AmazonTrackingStepper.jsx # Amazon package-style tracking stepper
│   │   │   ├── PriorityExplanationModal.jsx # Transparent math breakdown modal
│   │   │   ├── LocationPicker.jsx # Leaflet coordinate picker
│   │   │   ├── HotspotMap.jsx    # Leaflet OpenStreetMap hotspots
│   │   │   └── AnalyticsCharts.jsx # Recharts charts
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Faceted search & incident catalog
│   │   │   ├── SubmitComplaintPage.jsx # AI-assisted filing with duplicate radar
│   │   │   ├── ComplaintDetailPage.jsx # Full tracking view & official actions
│   │   │   ├── MyReportsPage.jsx # "Your Reports" (Amazon Your Orders style)
│   │   │   ├── UserLoginPage.jsx # Dedicated Citizen login & registration
│   │   │   ├── OfficialLoginPage.jsx # Dedicated Municipal Official portal
│   │   │   ├── OfficialDashboard.jsx # Municipal dispatch & triage console
│   │   │   └── HotspotsPage.jsx  # Fullscreen GIS Hotspot radar
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
├── render.yaml                   # 1-Click Render Blueprint configuration
├── build.sh                      # Render unified build script
├── Procfile                      # PaaS process file
├── Dockerfile                    # Container build configuration
├── requirements.txt              # Root Python dependencies
└── README.md
```

---

## ⚖️ License
CivicPulse is released under the **MIT License**.
