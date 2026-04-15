# SyncTech FlowOps - PRD

## Original Problem Statement
Hackathon project (Vibeathon 2k26 - Theme 2) — Autonomous quick-commerce dark store operations dashboard. Simulates three AI agents (Demand, Routing, Recovery) managing dark store operations without human intervention.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS
- **Backend**: FastAPI with LLM integration (GPT-4o-mini via Emergent LLM key)
- **LLM**: OpenAI GPT-4o-mini for real-time agent reasoning
- **Source**: Ported from Vite+TypeScript repo (https://github.com/Dhanush-webdev/SyncTech_FlowOps.git)

## Core Requirements
1. 3 Dark Store inventory cards (Alpha, Beta, Gamma) with progress bars
2. 5 Delivery Agent status cards with live badges (active/idle/stuck)
3. Real-time Agent Decision Log (DEMAND, ROUTING, INVENTORY, ALERT)
4. Stats bar: Delivered, Delayed, Active Agents, Success Rate (85-98%)
5. Dark theme (#0a0a0a), clean minimal UI
6. Orders generated every 3 seconds with simulation
7. LLM-powered agent reasoning (GPT-4o-mini)
8. Recovery Agent cascade visualization (modal overlay)
9. CASCADE ALERT banner for simultaneous failures
10. SyncTech FlowOps branding footer

## What's Been Implemented
### Session 1 (Jan 2026)
- [x] Full app ported from Vite+TS to CRA+JS
- [x] All 3 panels (stores, agents, decision log) working
- [x] Live simulation with autonomous agent decisions
- [x] Stats bar with real-time metrics

### Session 2 (Jan 2026)
- [x] Backend `/api/agent-reasoning` endpoint with GPT-4o-mini
- [x] Backend `/api/cascade-reasoning` endpoint for cascade events
- [x] LLM-powered agent reasoning (purple AI buttons in decision log)
- [x] Recovery Agent cascade modal with 4-phase timeline
- [x] CASCADE ALERT banner (flashing red, auto-resolving)
- [x] SyncTech FlowOps footer branding
- [x] All tests passing (100% backend + frontend)

## User Personas
- Hackathon judges evaluating autonomous/agentic systems
- Demo audience needing visual proof of agent decision-making

## Prioritized Backlog
- P0: All core features (DONE)
- P1: Orchestrator Agent (coordinator tying all three agents)
- P2: Weather/events-based demand prediction visualization
- P3: Historical analytics dashboard
- P3: Multi-language support for demo
