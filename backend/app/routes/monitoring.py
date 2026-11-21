
from flask import Blueprint, jsonify
from app.models import MonitoringMetric

monitoring_bp = Blueprint("monitoring", __name__)


@monitoring_bp.get("/")
def get_monitoring():

    metrics = MonitoringMetric.query.order_by(
        MonitoringMetric.created_at.desc()
    ).all()

    latest_metrics = {}

    for metric in metrics:
        name = (metric.metric_name or "").lower()

        if name not in latest_metrics:
            latest_metrics[name] = {
                "value": metric.value,
                "unit": metric.unit,
                "source": metric.source,
                "date": (
                    metric.created_at.strftime("%d %b %Y %H:%M")
                    if metric.created_at else None
                )
            }

    cpu = latest_metrics.get("cpu_usage")
    memory = latest_metrics.get("memory_usage")
    disk = latest_metrics.get("disk_usage")

    has_metrics = any([cpu, memory, disk])

    return jsonify({
        "status": "success",
        "data": {
            "application_status": "monitoring" if has_metrics else "no_data",
            "cpu_usage": cpu["value"] if cpu else 0,
            "memory_usage": memory["value"] if memory else 0,
            "disk_usage": disk["value"] if disk else 0,
            "metrics_unit": "percentage",
            "metrics_history": latest_metrics
        }
    }), 200
