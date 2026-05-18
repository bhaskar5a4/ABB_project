"""
Stub for future Kubernetes / Prometheus integration.

Planned:
- kubernetes Python client -> list pods, events
- Prometheus HTTP API -> CPU, memory, network time series
"""


async def fetch_pods_from_cluster():
    raise NotImplementedError("Connect to Minikube when ready")


async def fetch_prometheus_metrics(query: str):
    raise NotImplementedError("Connect to Prometheus when ready")
