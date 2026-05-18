from pydantic import BaseModel
from typing import Optional


class Pod(BaseModel):
    id: str
    name: str
    namespace: str
    status: str
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_traffic: float
    restart_count: int
    health_score: float
    anomaly_score: float


class Alert(BaseModel):
    id: str
    severity: str
    title: str
    description: str
    pod: Optional[str] = None
    namespace: Optional[str] = None
    timestamp: str = "2 min ago"


class Insight(BaseModel):
    id: str
    severity: str
    title: str
    description: str
    confidence: float
    recommendation: str
    affected_pod: Optional[str] = None
    affected_namespace: Optional[str] = None
    timestamp: str = "Just now"


class Dependency(BaseModel):
    source: str
    target: str
    traffic: int
    latency: float


class ForecastPoint(BaseModel):
    time: str
    actual: Optional[float] = None
    predicted: Optional[float] = None


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
