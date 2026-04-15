# SyncTech FlowOps - PRD

## Original Problem Statement
Hackathon project (Vibeathon 2k26 - Theme 2) — Autonomous quick-commerce dark store operations dashboard. Simulates three AI agents (Demand, Routing, Recovery) + Orchestrator managing dark store operations without human intervention. Theme: agentic + automated systems that react to real-world events autonomously.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS
- **Backend**: FastAPI with LLM integration
- **LLM**: OpenAI GPT-4o-mini via Emergent LLM key
- **Source**: Ported from Vite+TypeScript repo

## What's Been Implemented

### Session 1 (Jan 2026)
- [x] Full app ported from Vite+TS to CRA+JS
- [x] 3 Dark Store inventory panels (Alpha, Beta, Gamma)
- [x] 5 Delivery Agent cards with live status badges
- [x] Real-time Agent Decision Log (DEMAND, ROUTING, INVENTORY, ALERT)
- [x] Stats bar with 85-98% success rate
- [x] Dark theme (#0a0a0a), orders every 3s

### Session 2 (Jan 2026)
- [x] Backend `/api/agent-reasoning` endpoint (GPT-4o-mini)
- [x] Backend `/api/cascade-reasoning` endpoint
- [x] LLM-powered AI reasoning (purple AI buttons in decision log)
- [x] Recovery Agent cascade modal (4-phase timeline)
- [x] CASCADE ALERT banner (flashing red, auto-resolving)
- [x] SyncTech FlowOps footer branding

### Session 3 (Jan 2026)
- [x] **Weather/Events Demand Prediction** panel
  - Current weather conditions (sunny/rainy/stormy/windy/heatwave)
  - Local events (IPL Match, Diwali Festival, College Fest, Weekend Rush)
  - Zone demand forecast bars with trend indicators
  - AI-generated demand predictions via `/api/weather-prediction`
  - Weather cycles every 30s with new LLM predictions
- [x] **Orchestrator Agent Panel**
  - Real-time agent conflict detection and resolution
  - 5 conflict templates (DEMAND vs ROUTING, ROUTING vs RECOVERY, etc)
  - Expandable entries with conflict flow visualization
  - LLM-generated orchestrator reasoning via `/api/orchestrator-reasoning`
  - Auto-resolution in 3-5 seconds
- [x] All tests passing (100% backend + frontend + integration)

## API Endpoints
- `POST /api/agent-reasoning` - Agent reasoning generation
- `POST /api/cascade-reasoning` - Cascade recovery reasoning
- `POST /api/orchestrator-reasoning` - Orchestrator conflict resolution
- `POST /api/weather-prediction` - Weather-aware demand prediction

## Prioritized Backlog
- P1: "Demo Mode" button for live presentations
- P2: Historical analytics dashboard
- P3: Multi-language support
- P3: Sound effects for critical events
