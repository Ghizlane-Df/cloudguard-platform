
from flask import Blueprint, jsonify
from app.services.kubernetes_service import get_cluster_resources

infrastructure_bp = Blueprint("infrastructure", __name__)


@infrastructure_bp.get("/")
def get_infrastructure():

    try:
        cluster = get_cluster_resources()

        resources = []

        # Récupération des Pods réels
        for pod in cluster["pods"]:
            resources.append({
                "id": f'pod-{pod["namespace"]}-{pod["name"]}',
                "name": pod["name"],
                "type": "Pod",
                "namespace": pod["namespace"],
                "status": pod["status"],
                "date": None
            })

        # Récupération des Deployments réels
        for deployment in cluster["deployments"]:

            replicas = deployment["replicas"]
            ready = deployment["ready_replicas"]

            if ready >= replicas and replicas > 0:
                status = "Running"
            elif ready == 0:
                status = "Pending"
            else:
                status = "Progressing"

            resources.append({
                "id": f'deployment-{deployment["namespace"]}-{deployment["name"]}',
                "name": deployment["name"],
                "type": "Deployment",
                "namespace": deployment["namespace"],
                "status": status,
                "date": None
            })

        running = sum(
            1 for pod in cluster["pods"]
            if pod["status"] == "Running"
        )

        pending = sum(
            1 for pod in cluster["pods"]
            if pod["status"] == "Pending"
        )

        failed = sum(
            1 for pod in cluster["pods"]
            if pod["status"] in ["Failed", "Unknown"]
        )

        return jsonify({
            "status": "success",
            "data": {
                "total_resources": len(resources),
                "running": running,
                "pending": pending,
                "failed": failed,
                "total_nodes": len(cluster["nodes"]),
                "ready_nodes": sum(
                    1 for node in cluster["nodes"]
                    if node["status"] == "Ready"
                ),
                "total_pods": len(cluster["pods"]),
                "total_namespaces": len(cluster["namespaces"]),
                "total_deployments": len(cluster["deployments"]),
                "resource_history": resources
            }
        }), 200

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": "Unable to retrieve Kubernetes resources.",
            "details": str(error)
        }), 503
