from app.extensions import db
from datetime import datetime


class Deployment(db.Model):
    __tablename__ = "deployments"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    environment = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    version = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SecurityScan(db.Model):
    __tablename__ = "security_scans"

    id = db.Column(db.Integer, primary_key=True)
    tool = db.Column(db.String(50), nullable=False)
    target = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    vulnerabilities_count = db.Column(db.Integer, default=0)

    critical = db.Column(db.Integer, default=0)
    high = db.Column(db.Integer, default=0)
    medium = db.Column(db.Integer, default=0)
    low = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
class MonitoringMetric(db.Model):
    __tablename__ = "monitoring_metrics"

    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(100), nullable=False)
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(30))
    source = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Infrastructure(db.Model):
    __tablename__ = "infrastructure"

    id = db.Column(db.Integer, primary_key=True)
    resource_name = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)
    namespace = db.Column(db.String(100))
    status = db.Column(db.String(30), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


