# FLOW — Financial Lifecycle Optimization Workspace

**FLOW** (Financial Lifecycle Optimization Workspace) is a production-ready **Agentic FinOps Platform** using CrewAI for multi-agent orchestration, NestJS for APIs, and React with Chakra UI for dashboards. Fully mocked with realistic data to demonstrate all capabilities.

## 📁 Project Structure

```
.
├── backend/                  # Backend services
│   ├── src/                  # NestJS REST/GraphQL API
│   │   ├── controllers/      # REST controllers (costs, anomalies, recommendations, etc.)
│   │   ├── data/             # Mock data generators
│   │   ├── main.ts           # Entry point
│   │   ├── module.ts         # App module
│   │   ├── rest.costs.ts     # Costs REST controller
│   │   └── resolver.costs.ts # GraphQL resolver
│   ├── services/             # Backend services
│   │   └── crew/             # Python FastAPI + CrewAI
│   │       ├── app/
│   │       │   └── main.py   # CrewAI service
│   │       └── requirements.txt  # Service dependencies
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React + Chakra UI
│   ├── src/
│   │   ├── components/       # Reusable components (Layout, etc.)
│   │   ├── pages/            # Dashboard pages
│   │   │   ├── App.tsx       # Router configuration
│   │   │   ├── Overview.tsx  # Executive dashboard
│   │   │   ├── CostExplorer.tsx
│   │   │   ├── ShowChargeback.tsx
│   │   │   ├── costs/
│   │   │   │   └── Costs.tsx # Cost Explorer hub with side navigation
│   │   │   ├── Anomalies.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   ├── Tagging.tsx
│   │   │   ├── software/
│   │   │   │   └── Software.tsx
│   │   │   └── admin/…       # Admin pages
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt          # Root Python dependencies (for venv setup)
├── setup_venv.ps1           # Windows virtual environment setup script
├── setup_venv.sh             # Linux/Mac virtual environment setup script
├── venvFinOps/               # Python virtual environment (created by setup)
└── README.md
```

## 🚀 Quick Start

> 📖 **For a condensed quick start guide, see [QUICKSTART.md](QUICKSTART.md)**

### Prerequisites
- **Node.js** 18+ (for backend and frontend)
- **Python** 3.10+ (for CrewAI service)
- **npm** or **yarn**

### 1. Set Up Python Virtual Environment

**Windows (PowerShell):**
```powershell
.\setup_venv.ps1
```

**Linux/Mac:**
```bash
chmod +x setup_venv.sh
./setup_venv.sh
```

**Manual setup:**
```bash
# Create virtual environment
python -m venv venvFinOps

# Activate (Windows)
venvFinOps\Scripts\activate

# Activate (Linux/Mac)
source venvFinOps/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Install Dependencies

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

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**Python:**
```bash
# After venv setup (from step 1)
pip install -r requirements.txt
```

### 3. Start All Services

Open **three terminal windows**:

**Terminal 1: Backend API (NestJS)**
```bash
cd backend
npm run start:dev
```
✅ API running on http://localhost:8081
- REST endpoints: http://localhost:8081/v1/*
- GraphQL Playground: http://localhost:8081/graphql

**Terminal 2: Frontend Dashboard (React)**
```bash
cd frontend
npm run dev
```
✅ Web UI running on http://localhost:5173

**Terminal 3: CrewAI Service (Python FastAPI)**
```bash
# Activate virtual environment first!
# Windows:
venvFinOps\Scripts\activate
# Linux/Mac:
source venvFinOps/bin/activate

cd backend/services/crew
uvicorn app.main:app --reload --port 8000
```
✅ CrewAI service running on http://localhost:8000

### 4. Access the Platform

- 🌐 **Web Dashboard**: http://localhost:5173
- 🔌 **API REST**: http://localhost:8081/v1/costs
- 📊 **GraphQL Playground**: http://localhost:8081/graphql
- 🤖 **CrewAI Health**: http://localhost:8000/health
- 🤖 **CrewAI Agents**: http://localhost:8000/crew/agents

## 📊 Features & Dashboards

### Overview Dashboard (`/`)
- Executive KPIs (Allocation Coverage, Forecast Accuracy, Savings Pipeline)
- Cost trend charts (30 days)
- Service breakdown (pie chart)
- Real-time metrics with trend indicators

### Cost Explorer Hub (`/costs`)
- Sidebar navigation with two modes:
  - **Cost Explorer** (`/costs/explorer`) for granular exploration of license + usage spend
  - **Show / Charge Back** (`/costs/show-chargeback`) for allocation recovery and variance tracking
- Persistent filters and charts scoped to the selected sub-view

#### Cost Explorer (`/costs/explorer`)
- Group costs by day, service, cloud provider, or vendor
- Interactive charts (Bar & Line) with granularity controls
- Detailed table view with license + usage breakdown
- Filter by platform, provider, service, product, LOB, and application

#### Show / Charge Back (`/costs/show-chargeback`)
- Chargeback vs showback trend visualization
- Recovery coverage by bucket with variance badges
- Business unit allocation table (showback, chargeback, variance, owners)
- Executive summary cards (run-rate totals, recovery rate, variance)
- Highlighted next actions driven by portfolio agents

### Anomalies Hub (`/anomalies`)
- Real-time anomaly feed
- Filter by status and severity
- Root cause analysis summaries
- Suggested remediation actions
- One-click resolution workflow

### Optimization Recommendations (`/recommendations`)
- Right-sizing opportunities
- Reserved instance recommendations
- Idle cleanup candidates
- Risk and confidence scoring
- Approve/reject workflow

### Agentic Workflows (`/workflows`)
- Live workflow status
- Step-by-step progress tracking
- Agent metrics and outcomes
- Temporal workflow visualization

### Tagging & Allocation (`/tagging`)
- Allocation coverage stats
- Coverage by tag key
- Trend analysis
- Missing tag tracking

### Audit & Explainability (`/audit`)
- Complete audit trail of agent decisions
- Step-by-step reasoning
- Policy matches
- Hash-verified audit entries

## 🔌 API Endpoints

### REST Endpoints (NestJS - Port 8081)
- `GET /v1/costs` - List costs with filtering and grouping
- `GET /v1/anomalies` - List anomalies (filter by status/severity)
- `GET /v1/recommendations` - List optimization recommendations
- `GET /v1/workflows` - List active workflows
- `GET /v1/kpis` - Get executive KPIs
- `GET /v1/audit` - Get audit trail
- `GET /v1/allocations/stats` - Get allocation statistics

### CrewAI Endpoints (FastAPI - Port 8000)
- `GET /health` - Service health check
- `GET /crew/agents` - List all available agents and their status
- `POST /crew/run` - Run a task with a specific agent
- `GET /crew/tasks/{task_id}` - Get status of a running task
- `GET /crew/audit` - Get recent agent decision audit trail

### GraphQL (NestJS - Port 8081)
- Access GraphQL Playground at http://localhost:8081/graphql
- Query costs with filters: `query Costs($filter: CostFilter!) { ... }`

## 🤖 Available Agents

1. **FinOps Orchestrator** - Coordinates workflows and enforces SLAs
2. **Allocation Agent** - Handles tagging and cost allocation
3. **Optimization Agent** - Identifies savings opportunities
4. **Anomaly Agent** - Detects cost anomalies and performs RCA
5. **Forecasting Agent** - Generates cost forecasts
6. **Governance Agent** - Enforces policies and compliance

## 📝 Mock Data

All endpoints return realistic mock data:
- **30 days** of cost data across AWS, Azure, GCP
- **15 anomalies** with varying severity
- **20 recommendations** for optimization
- **3 active workflows** with progress tracking
- **30 audit entries** with reasoning traces

Data is generated on-the-fly with realistic patterns and relationships. No database required - everything runs in-memory for easy demo purposes.

## 🛠️ Development

### Backend Development (NestJS)
```bash
cd backend
npm run start:dev  # Watch mode with hot reload
npm run build      # Build for production
npm run lint       # Run linter
```

### Frontend Development (React)
```bash
cd frontend
npm run dev        # Vite dev server with HMR
npm run build      # Build for production
npm run preview    # Preview production build
```

### CrewAI Service Development (Python)
```bash
# Activate virtual environment first!
source venvFinOps/bin/activate  # or venvFinOps\Scripts\activate on Windows

cd backend/services/crew
uvicorn app.main:app --reload --port 8000  # Auto-reload on changes
```

## 📦 Project Organization

The project follows a clean separation of concerns:

- **`backend/src/`** - NestJS API with REST and GraphQL endpoints
- **`backend/services/crew/`** - Python FastAPI service for CrewAI agents
- **`frontend/`** - React application with Chakra UI components

Each service has its own dependencies:
- `backend/package.json` - Node.js dependencies for NestJS
- `backend/services/crew/requirements.txt` - Python dependencies for CrewAI
- `frontend/package.json` - Node.js dependencies for React
- `requirements.txt` (root) - Used for initial venv setup

## 🔧 Configuration

### Environment Variables

Currently no environment variables are required for the demo. In production, you would set:
- Database connection strings
- API keys for cloud providers
- Authentication secrets
- Service URLs

### Ports

- **Backend API**: 8081
- **Frontend**: 5173
- **CrewAI Service**: 8000

All services have CORS enabled for local development.

## 📦 Next Steps

To extend this starter:

1. **Connect Real Data Sources**
   - AWS Cost & Usage Report (CUR) ingestion
   - Azure Cost Management exports
   - GCP Billing Export

2. **Integrate Real CrewAI Agents**
   - Replace mock responses with actual agent logic
   - Connect to cloud SDKs for real actions
   - Implement tool integrations (dbt, OPA, etc.)

3. **Add Authentication**
   - Keycloak/OAuth2
   - RBAC
   - Multi-tenant isolation

4. **Enhance Data Pipeline**
   - dbt transformations
   - Great Expectations
   - OpenLineage

5. **Add Database**
   - PostgreSQL for operational data
   - ClickHouse/BigQuery for analytics
   - Redis for caching

## 🔒 Security Notes

This is a **development/demo** implementation. For production:
- Add authentication (Keycloak/OAuth2)
- Implement RBAC
- Secure API endpoints
- Encrypt sensitive data
- Add rate limiting
- Enable audit logging
- Use environment variables for secrets
- Implement proper CORS policies

## 🐛 Troubleshooting

### Port Already in Use
If ports 8081, 5173, or 8000 are in use:
- Kill the process using the port or change ports in the config files

### Python Module Not Found
Make sure virtual environment is activated:
```bash
# Windows
venvFinOps\Scripts\activate

# Mac/Linux
source venvFinOps/bin/activate
```

### API Not Responding
- Check that backend API is running on port 8081
- Check CORS is enabled (should be automatic)
- Check browser console for errors
- Verify all dependencies are installed

### Charts Not Loading
- Ensure backend API is running first
- Check browser network tab for API calls
- Verify recharts is installed: `npm list recharts`

### CrewAI Service Not Starting
- Ensure virtual environment is activated
- Check Python version (3.10+ required)
- Verify all dependencies: `pip list`
- Check for port conflicts on 8000

## 📄 License

This starter is provided as a reference implementation aligned with the **FLOW — Financial Lifecycle Optimization Workspace** blueprint.

## 🙏 Acknowledgments

Built following the blueprint specification in `Docs/Reference/agentic_fin_ops_platform_enterprise_blueprint_implementation_crew_ai_node.md`
