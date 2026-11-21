
from flask import Blueprint, jsonify
from app.services.kubernetes_service import get_cluster_resources

deployments_bp = Blueprint("deployments", __name__)


@deployments_bp.get("/")
def get_deployments():

    try:
        cluster = get_cluster_resources()
        deployment_history = []

        successful = 0
        failed = 0
        running = 0

        for deployment in cluster["deployments"]:

            replicas = deployment["replicas"]
            ready = deployment["ready_replicas"]

            if ready == replicas and replicas > 0:
                status = "Successful"
                successful += 1
            elif ready < replicas:
                status = "In Progress"
                running += 1
            else:
                status = "Failed"
                failed += 1

            deployment_history.append({
                "id": f'{deployment["namespace"]}-{deployment["name"]}',
                "application": deployment["name"],
                "version": "Kubernetes",
                "environment": deployment["namespace"],
                "status": status,
                "date": None,
                "replicas": replicas,
                "ready_replicas": ready
            })

        return jsonify({
            "status": "success",
            "data": {
                "total_deployments": len(deployment_history),
                "successful": successful,
                "failed": failed,
                "running": running,
                "deployment_history": deployment_history
            }
        }), 200

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": "Unable to retrieve Kubernetes deployments.",
            "details": str(error)
        }), 503
