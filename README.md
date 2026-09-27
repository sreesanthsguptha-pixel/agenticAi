# Agentflow AI — Agentic AI Automation Platform

**Agentflow AI** is a full-stack AI Operations Automation Platform that allows operators to describe automations in natural language, generate executable visual workflow graphs, render and edit them on an interactive drag-and-drop canvas, and execute them through a chain of 5 cooperating AI agents with live Socket.IO event streaming and encrypted third-party integrations.

---

## 🌟 Architecture & Features

- **Prompt-to-Workflow AI Generator**: Turn natural language prompts into complete node-and-edge graph workflows. Uses **OpenRouter API** as primary provider, falls back to **Google Gemini**, and features a built-in **Deterministic Rule Builder** fallback when no API keys are present.
- **Interactive Drag-and-Drop Canvas**: Built with **React Flow** (`@xyflow/react`), custom styled nodes, dynamic handles, animated edges, left node catalog palette, and right-hand inspector panel.
- **5-Agent Orchestration Chain**:
  1. **Planner Agent**: Performs topological sorting and calculates confidence scores.
  2. **Execution Agent**: Executes graph nodes against AI models or third-party APIs.
  3. **Validation Agent**: Validates output fields and schema integrity.
  4. **Recovery Agent**: Classifies failures (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and decides between retry backoff and operator escalation.
  5. **Monitoring Agent**: Emits real-time Socket.IO events and persists timeline logs.
- **Encrypted OAuth Integrations**: AES-256-CBC encryption at rest for sensitive access/refresh tokens across Gmail, Slack, Discord, and Google Sheets.
- **Zero-Config In-Memory Fallback**: Runs out-of-the-box locally without needing MongoDB or Redis running! If MongoDB or Redis is not connected, the system automatically uses built-in in-memory storage and queue fallback engines.

---

## 📁 Repository Structure

```
.
├── package.json               # Root workspace script launcher (runs client & server concurrently)
├── README.md                  # Local setup documentation & guide
├── server/                    # Node.js + Express + Socket.IO + Agent Engine Backend
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── agents/            # Planner, Execution, Validation, Recovery, Monitoring & Orchestrator
│       ├── config/            # Env, Database (with fallback), Socket.IO, In-Memory Store
│       ├── controllers/       # HTTP response controllers
│       ├── integrations/      # Base, Gmail, Slack, Discord, Google Sheets providers
│       ├── middleware/        # JWT Authentication middleware
│       ├── models/            # Mongoose Schemas (User, Workflow, Execution, Log, Integration, Notification)
│       ├── queues/            # BullMQ background job queue handler with in-memory fallback
│       ├── routes/            # REST API Routes
│       ├── services/          # Core business logic services
│       └── index.js           # Server entry point
└── client/                    # Next.js (Pages Router) + Tailwind CSS + Zustand Frontend
    ├── package.json
    ├── tailwind.config.js
    ├── next.config.js
    └── src/
        ├── components/        # AppShell, MetricGrid, NodePalette, NodeConfigPanel, WorkflowCanvas, Timeline, NotificationDrawer
        ├── pages/             # Landing (/), Login, Register, Dashboard, Workflows, Builder, Executions, Integrations, Settings
        ├── services/          # Axios API & Socket.IO client
        ├── store/             # Zustand Auth & Workflow stores
        └── styles/            # Tailwind CSS globals & React Flow styles
```

---

## 🚀 Step-by-Step Instructions to Run Locally

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- *(Optional)* **MongoDB** (Local instance or MongoDB Atlas URI)
- *(Optional)* **Redis** (Local instance or Redis Cloud URI)

> 💡 **Note**: MongoDB and Redis are **optional** for local development. If MongoDB or Redis is not running, the application will automatically initialize in **In-Memory Storage Mode** so you can develop and test immediately without installing external services!

---

### Step 1: Clone & Install Dependencies

In the root directory (`c:\Users\aswin\project`), install dependencies for both `server` and `client`:

```bash
# Option A: Install all workspace dependencies from root
npm run install:all

# Option B: Install individually
cd server && npm install
cd ../client && npm install
```

---

### Step 2: Environment Variables Setup

#### Server Environment (`server/.env`)
Create a `.env` file inside the `server/` folder (you can copy from `server/.env.example`):

```bash
cp server/.env.example server/.env
```

Default contents of `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=super-secret-jwt-key-agentflow-ai-2026
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
MONGODB_URI=mongodb://localhost:27017/agentflow_ai
REDIS_URL=redis://localhost:6379
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

#### Client Environment (`client/.env.local`)
Create a `.env.local` file inside the `client/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

### Step 3: Run the Application Locally

#### Method 1: Concurrent Dev Server (Recommended)
From the root directory, run:

```bash
npm run dev
```

This launches both the Express backend server (`http://localhost:5000`) and the Next.js frontend client (`http://localhost:3000`) concurrently.

#### Method 2: Separate Terminals

**Terminal 1 (Backend Server):**
cd server
npm run dev
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```

---

## 💻 Operating the Platform

1. Open your browser and navigate to **`http://localhost:3000`**.
2. Click **Sign In** or **Get Started**. You can use the quick **Fill Demo Credentials** button on `/login` (`operator@agentflow.ai` / `operator123`).
3. Navigate to **AI Builder** (`/workflows/builder`) and enter a prompt such as:
   > *"When an invoice email arrives, summarize details with AI, post alert to Slack, and append row to Google Sheets."*
4. Click **Generate Workflow** to view the generated node-and-edge graph.
5. Click **Open in Canvas Editor** to edit node parameters, add new nodes from the catalog, and connect edges.
6. Click **Execute Run** and open **Real-time Logs** to watch the 5 agents (Planner, Execution, Validation, Recovery, Monitoring) stream events live via Socket.IO!

---

## 🛠️ REST API Endpoints Reference

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | System status check & database/LangGraph mode |
| **Auth** | `POST` | `/api/auth/register` | Register new user account |
| | `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| | `GET` | `/api/auth/me` | Fetch authenticated operator profile |
| **Workflows** | `GET` | `/api/workflows/dashboard` | Aggregated metrics & recent execution runs |
| | `GET` | `/api/workflows` | Search & list workflows |
| | `POST` | `/api/workflows` | Create workflow manually |
| | `POST` | `/api/workflows/generate` | Generate workflow graph from prompt via AI |
| | `GET` | `/api/workflows/:id` | Fetch single workflow graph |
| | `PUT` | `/api/workflows/:id` | Update workflow structure |
| | `POST` | `/api/workflows/:id/duplicate` | Clone workflow |
| | `POST` | `/api/workflows/:id/execute` | Trigger agentic execution run |
| | `DELETE` | `/api/workflows/:id` | Delete workflow |
| **Executions** | `GET` | `/api/executions` | List execution history |
| | `GET` | `/api/executions/:id` | Get execution snapshot & status |
| | `GET` | `/api/executions/:id/timeline` | Get agent timeline logs |
| | `POST` | `/api/executions/:id/pause` | Pause running execution |
| | `POST` | `/api/executions/:id/resume` | Resume paused execution |
| | `POST` | `/api/executions/:id/cancel` | Cancel running execution |
| **Integrations**| `GET` | `/api/integrations` | List integration credentials status |
| | `GET` | `/api/integrations/oauth/:provider/start` | Start OAuth connection flow |
| | `GET` | `/api/integrations/oauth/:provider/callback` | OAuth callback handler |
