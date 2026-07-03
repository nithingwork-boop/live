# Quick Start Guide

Get the Agentic FinOps Platform up and running in minutes.

## Prerequisites

- **Node.js** 18+ 
- **Python** 3.10+
- **npm**

## 1. Set Up Python Virtual Environment

**Windows:**
```powershell
.\setup_venv.ps1
```

**Linux/Mac:**
```bash
chmod +x setup_venv.sh
./setup_venv.sh
```

**Or manually:**
```bash
python -m venv venvFinOps
# Windows: venvFinOps\Scripts\activate
# Linux/Mac: source venvFinOps/bin/activate
pip install -r requirements.txt
```

## 2. Install Dependencies

**Automated (Recommended):**

**Windows:**
```powershell
.\install.ps1
```

**Linux/Mac:**
```bash
chmod +x install.sh
./install.sh
```

**Or manually:**
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install

# Python (after venv setup)
pip install -r requirements.txt
```

## 3. Start Services

Open **3 terminal windows**:

**Terminal 1 - Backend API:**
```bash
cd backend
npm run start:dev
```
✅ Running on http://localhost:8081

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Running on http://localhost:5175

**Terminal 3 - CrewAI Service:**
```bash
# Activate venv first!
# Windows: venvFinOps\Scripts\activate
# Linux/Mac: source venvFinOps/bin/activate

cd backend/services/crew
uvicorn app.main:app --reload --port 8000
```
✅ Running on http://localhost:8000

## 4. Access the Platform

- 🌐 **Dashboard**: http://localhost:5173
- 🔌 **API**: http://localhost:8081/v1/costs
- 📊 **GraphQL**: http://localhost:8081/graphql
- 🤖 **CrewAI**: http://localhost:8000/health

## What's Next?

Once all services are running:
1. Open http://localhost:5173 in your browser
2. Navigate through the dashboards (Overview, Cost Explorer, Anomalies, etc.)
3. All data is mocked - no database required!

## Troubleshooting

**Port in use?** Change ports in config files or kill the process.

**Python errors?** Make sure virtual environment is activated:
```bash
# Windows
venvFinOps\Scripts\activate

# Linux/Mac
source venvFinOps/bin/activate
```

**Dependencies missing?** Run `npm install` in backend/ and frontend/ folders.

For detailed information, see [README.md](README.md).

