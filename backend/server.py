from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM key
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class AgentReasoningRequest(BaseModel):
    agent_type: str
    context: str

class CascadeReasoningRequest(BaseModel):
    trigger_order: str
    affected_orders: List[str]
    zone: str
    context: str


AGENT_SYSTEM_PROMPTS = {
    "demand": """You are the DEMAND AGENT in an autonomous quick-commerce dark store system. 
You analyze real-time order patterns and predict demand spikes. You make inventory transfer decisions between dark stores.
Generate a single concise reasoning statement (1-2 sentences max) about your decision. Sound analytical and data-driven.
Use specific numbers and percentages. Example tone: "Detected 47% order surge in Zone A over last 90s. Triggering preemptive restock of 25 dairy units from Store Beta (current surplus: 82%)."
Do NOT use markdown. Plain text only.""",

    "routing": """You are the ROUTING AGENT in an autonomous quick-commerce dark store system.
You dynamically reassign delivery agents when SLA breaches are predicted. You analyze agent locations, traffic, and order priority.
Generate a single concise reasoning statement (1-2 sentences max) about your routing decision. Sound tactical and precise.
Use agent names and specific details. Example tone: "Rajan's ETA exceeded threshold by 4.2min — rerouting via alternate path. Reassigning Priya to cover ORD-1847 (priority: critical, 2.1km closer)."
Do NOT use markdown. Plain text only.""",

    "recovery": """You are the RECOVERY AGENT in an autonomous quick-commerce dark store system.
You detect cascade failures — when one delayed order triggers ripple effects on other orders. You auto-compensate by rescheduling, rerouting, and adjusting ETAs.
Generate a single concise reasoning statement (1-2 sentences max) about your recovery action. Sound urgent but controlled.
Example tone: "Cascade detected: ORD-1203 delay propagating to 3 downstream orders. Initiating auto-recovery — rescheduling ETAs, rerouting Agent Suresh to intercept."
Do NOT use markdown. Plain text only.""",

    "inventory": """You are the INVENTORY AGENT in an autonomous quick-commerce dark store system.
You monitor stock levels across all dark stores and trigger automatic reorders when thresholds are breached.
Generate a single concise reasoning statement (1-2 sentences max) about your inventory decision. Sound precise and proactive.
Example tone: "Store Gamma dairy stock at 18% — below critical threshold. Auto-triggering emergency reorder of 40 units. ETA to shelf: 12min."
Do NOT use markdown. Plain text only.""",
}


@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/agent-reasoning")
async def generate_agent_reasoning(request: AgentReasoningRequest):
    agent_type = request.agent_type.lower()
    system_prompt = AGENT_SYSTEM_PROMPTS.get(agent_type, AGENT_SYSTEM_PROMPTS["demand"])

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"agent-{agent_type}-{uuid.uuid4().hex[:8]}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o-mini")

        user_message = UserMessage(text=f"Current situation: {request.context}\n\nGenerate your reasoning for this decision.")
        response = await chat.send_message(user_message)
        return {"reasoning": response, "agent_type": agent_type}
    except Exception as e:
        logger.error(f"LLM reasoning error: {e}")
        return {"reasoning": f"[{agent_type.upper()} AGENT] Processing autonomous decision based on real-time data analysis.", "agent_type": agent_type}


@api_router.post("/cascade-reasoning")
async def generate_cascade_reasoning(request: CascadeReasoningRequest):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"cascade-{uuid.uuid4().hex[:8]}",
            system_message=AGENT_SYSTEM_PROMPTS["recovery"]
        ).with_model("openai", "gpt-4o-mini")

        context = (
            f"CRITICAL CASCADE EVENT: Order {request.trigger_order} delayed in {request.zone}. "
            f"Ripple effect detected on {len(request.affected_orders)} orders: {', '.join(request.affected_orders)}. "
            f"Additional context: {request.context}. "
            f"Describe your cascade recovery action in 2-3 sentences. Include specific order IDs and agent names."
        )
        user_message = UserMessage(text=context)
        response = await chat.send_message(user_message)
        return {"reasoning": response, "trigger_order": request.trigger_order, "affected_orders": request.affected_orders}
    except Exception as e:
        logger.error(f"Cascade reasoning error: {e}")
        return {
            "reasoning": f"Cascade detected from {request.trigger_order}. Auto-initiating recovery protocol — rescheduling {len(request.affected_orders)} affected orders and rerouting available agents.",
            "trigger_order": request.trigger_order,
            "affected_orders": request.affected_orders
        }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
