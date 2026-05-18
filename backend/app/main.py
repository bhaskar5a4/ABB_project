"""
KubeMind AI FastAPI backend.
Ready for Minikube + Prometheus integration via services/k8s_client.py (stub).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .data import PODS, ALERTS, INSIGHTS, DEPENDENCIES, FORECAST
from .models import ChatRequest, ChatResponse

app = FastAPI(
    title="KubeMind AI API",
    description="Kubernetes observability and AI intelligence API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "kubemind-api"}


@app.get("/pods")
def get_pods():
    return {"pods": PODS}


@app.get("/metrics")
def get_metrics():
    if not PODS:
        return {"cpu": 0, "memory": 0, "disk": 0, "network": 0}
    return {
        "cpu": sum(p.cpu_usage for p in PODS) / len(PODS),
        "memory": sum(p.memory_usage for p in PODS) / len(PODS),
        "disk": sum(p.disk_usage for p in PODS) / len(PODS),
        "network": sum(p.network_traffic for p in PODS) / len(PODS),
    }


@app.get("/alerts")
def get_alerts():
    return {"alerts": ALERTS}


@app.get("/insights")
def get_insights():
    return {"insights": INSIGHTS}


@app.get("/forecast")
def get_forecast():
    return {"forecast": FORECAST}


@app.get("/dependencies")
def get_dependencies():
    return {"dependencies": DEPENDENCIES}


@app.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest):
    q = body.message.lower()
    if "fail" in q or "crash" in q:
        reply = "notification-service is in CrashLoopBackOff with 15 restarts. payment-service shows high CPU."
    elif "cpu" in q:
        reply = "payment-service is the top CPU consumer at ~89%. Consider scaling and query optimization."
    elif "predict" in q:
        reply = "Elevated risk on analytics-engine (memory) and notification-service (restarts) within 6 hours."
    else:
        reply = "Cluster has 6 core services monitored. Ask about failures, CPU, memory, or predictions."
    return ChatResponse(reply=reply)
