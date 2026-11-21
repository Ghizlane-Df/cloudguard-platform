from flask import Flask, jsonify
from flask_cors import CORS
from app.routes.security import security_bp
from app.routes.deployments import deployments_bp
from app.routes.monitoring import monitoring_bp
from dotenv import load_dotenv
from app.extensions import db
from app.routes.infrastructure import infrastructure_bp

from app.config import Config
from app.routes.dashboard import dashboard_bp

def create_app(test_config=None):

    load_dotenv("../.env", override=True)

    app = Flask(__name__)
    app.config.from_object(Config)
    
    app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024
    if test_config:
        app.config.update(test_config)
    db.init_app(app)

    CORS(app)

    @app.get("/api/health")
    def health():
        return jsonify({
            "status": "success",
            "message": "CloudGuard Backend is running"
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": "error",
            "message": "Resource not found"
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500
    
    app.register_blueprint(
        dashboard_bp,
        url_prefix="/api/dashboard"
    )
    app.register_blueprint(
        security_bp,
        url_prefix="/api/security"
    )
    app.register_blueprint(
        deployments_bp,
        url_prefix="/api/deployments"
    )
    app.register_blueprint(
        infrastructure_bp,
        url_prefix="/api/infrastructure"
    )
    app.register_blueprint(
        monitoring_bp,
        url_prefix="/api/monitoring"
    )

    return app