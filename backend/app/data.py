"""Mock Kubernetes data — replace with Minikube / Prometheus clients later."""

from .models import Pod, Alert, Insight, Dependency, ForecastPoint

PODS = [
    Pod(
        id="1",
        name="auth-service",
        namespace="production",
        status="Running",
        cpu_usage=45,
        memory_usage=62,
        disk_usage=38,
        network_traffic=120,
        restart_count=0,
        health_score=94,
        anomaly_score=8,
    ),
    Pod(
        id="2",
        name="payment-service",
        namespace="production",
        status="Running",
        cpu_usage=89,
        memory_usage=78,
        disk_usage=52,
        network_traffic=340,
        restart_count=3,
        health_score=58,
        anomaly_score=82,
    ),
    Pod(
        id="3",
        name="gateway-api",
        namespace="production",
        status="Running",
        cpu_usage=34,
        memory_usage=41,
        disk_usage=28,
        network_traffic=890,
        restart_count=0,
        health_score=96,
        anomaly_score=12,
    ),
    Pod(
        id="4",
        name="analytics-engine",
        namespace="analytics",
        status="Running",
        cpu_usage=72,
        memory_usage=68,
        disk_usage=61,
        network_traffic=210,
        restart_count=1,
        health_score=71,
        anomaly_score=65,
    ),
    Pod(
        id="5",
        name="recommendation-engine",
        namespace="analytics",
        status="Running",
        cpu_usage=67,
        memory_usage=55,
        disk_usage=44,
        network_traffic=180,
        restart_count=0,
        health_score=88,
        anomaly_score=22,
    ),
    Pod(
        id="6",
        name="notification-service",
        namespace="production",
        status="CrashLoopBackOff",
        cpu_usage=12,
        memory_usage=89,
        disk_usage=71,
        network_traffic=45,
        restart_count=15,
        health_score=24,
        anomaly_score=94,
    ),
]

DEPENDENCIES = [
    Dependency(source="gateway-api", target="auth-service", traffic=1250, latency=12),
    Dependency(source="gateway-api", target="payment-service", traffic=890, latency=45),
    Dependency(source="gateway-api", target="notification-service", traffic=560, latency=180),
    Dependency(source="payment-service", target="analytics-engine", traffic=450, latency=95),
    Dependency(source="recommendation-engine", target="analytics-engine", traffic=780, latency=23),
]

INSIGHTS = [
    Insight(
        id="1",
        severity="critical",
        title="payment-service is consuming abnormally high CPU resources",
        description="CPU at 89% with correlated DB latency.",
        confidence=94,
        recommendation="Scale horizontally and optimize queries.",
        affected_pod="payment-service",
    ),
    Insight(
        id="2",
        severity="warning",
        title="Memory leak suspected in analytics-engine",
        description="Sustained heap growth detected.",
        confidence=87,
        recommendation="Profile heap and restart after capture.",
        affected_pod="analytics-engine",
    ),
]

ALERTS = [
    Alert(
        id="1",
        severity="critical",
        title="Pod CrashLoopBackOff",
        description="notification-service restarted 15 times",
        pod="notification-service",
    ),
    Alert(
        id="2",
        severity="warning",
        title="CPU spike detected",
        description="payment-service CPU exceeds 85%",
        pod="payment-service",
    ),
]

FORECAST = [
    ForecastPoint(time="Now", actual=67, predicted=67),
    ForecastPoint(time="+1h", predicted=72),
    ForecastPoint(time="+4h", predicted=85),
]
