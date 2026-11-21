from flask import Blueprint, jsonify
from app.models import Deployment

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/")
def get_dashboard():

    # Récupérer les déploiements depuis PostgreSQL
    deployments = Deployment.query.order_by(
        Deployment.created_at.desc()
    ).all()

    # Calculer les statistiques
    total_deployments = Deployment.query.count()

    successful_deployments = Deployment.query.filter_by(
        status="Successful"
    ).count()

    failed_deployments = Deployment.query.filter_by(
        status="Failed"
    ).count()

    # Préparer les derniers déploiements
    recent_deployments = []

    for deployment in deployments[:5]:
        recent_deployments.append({
            "id": deployment.id,
            "name": deployment.name,
            "environment": deployment.environment,
            "version": deployment.version,
            "status": deployment.status,
            "date": (
                deployment.created_at.strftime("%d %b %Y")
                if deployment.created_at
                else None
            )
        })

    return jsonify({
        "status": "success",
        "data": {
            "platform": "CloudGuard",

            "infrastructure": {
                "total_clusters": 0,
                "healthy_nodes": 0,
                "total_nodes": 0
            },

            "deployments": {
                "total": total_deployments,
                "successful": successful_deployments,
                "failed": failed_deployments
            },

            "security": {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            },

            "recent_deployments": recent_deployments
        }
    }), 200