# SyncTech FlowOps - PRD

## Original Problem Statement
Hackathon project (Vibeathon 2k26 - Theme 2) — Autonomous quick-commerce dark store operations dashboard. Simulates three AI agents (Demand, Routing, Recovery) managing dark store operations without human intervention.

## Architecture
- **Frontend only**: React (CRA) + Tailwind CSS
- **No backend needed**: All data simulated via `useSimulation` hook
- **Source**: Ported from Vite+TypeScript repo (https://github.com/Dhanush-webdev/SyncTech_FlowOps.git)

## Core Requirements
1. 3 Dark Store inventory cards (Alpha, Beta, Gamma) with progress bars
2. 5 Delivery Agent status cards with live badges (active/idle/stuck)
3. Real-time Agent Decision Log (DEMAND, ROUTING, INVENTORY, ALERT)
4. Stats bar: Delivered, Delayed, Active Agents, Success Rate (85-98%)
5. Dark theme (#0a0a0a), clean minimal UI
6. Orders generated every 3 seconds with simulation

## What's Been Implemented (Jan 2026)
- [x] Full app ported from Vite+TS to CRA+JS
- [x] All 3 panels (stores, agents, decision log) working
- [x] Live simulation with autonomous agent decisions
- [x] Stats bar with real-time metrics
- [x] All tests passing (100% frontend)

## User Personas
- Hackathon judges evaluating autonomous/agentic systems
- Demo audience needing visual proof of agent decision-making

## Prioritized Backlog
- P0: App running as-is (DONE)
- P1: CASCADE ALERT banner (mentioned in earlier message, removed in simplification)
- P1: SyncTech branding footer ("Powered by SyncTech FlowOps")
- P2: Real LLM-powered agent reasoning (Claude/OpenAI for decisions)
- P2: Recovery Agent cascade detection and resolution visualization
- P3: Backend agent orchestrator with actual logic
