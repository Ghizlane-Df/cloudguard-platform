
import pytest
from app import create_app
from app.extensions import db
from app.models import Deployment, SecurityScan, MonitoringMetric, Infrastructure


@pytest.fixture
def client():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })

    with app.app_context():
        db.create_all()

        with app.test_client() as client:
            yield client

        db.session.remove()
        db.drop_all()


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "success"


def test_dashboard(client):
    response = client.get("/api/dashboard/")
    assert response.status_code == 200
    assert response.get_json()["data"]["platform"] == "CloudGuard"


def test_security(client):
    response = client.get("/api/security/")
    assert response.status_code == 200
    assert "scanners" in response.get_json()["data"]


def test_deployments(client, monkeypatch):
    from app.routes import deployments

    monkeypatch.setattr(
        deployments,
        "get_cluster_resources",
        lambda: {"deployments": []}
    )

    response = client.get("/api/deployments/")

    assert response.status_code == 200
    assert "deployment_history" in response.get_json()["data"]


def test_monitoring(client):
    response = client.get("/api/monitoring/")
    assert response.status_code == 200
    assert "cpu_usage" in response.get_json()["data"]
