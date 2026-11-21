from flask import Flask, jsonify
from flask_cors import CORS


from app.config import Config
from app.routes.dashboard import dashboard_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    # Register API routes
    app.register_blueprint(
        dashboard_bp,
        url_prefix="/api/dashboard"
    )

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

    return app