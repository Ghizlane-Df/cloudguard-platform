import os
import tempfile

from flask import Blueprint, jsonify, request, current_app
from app.extensions import db
from app.services.trivy_service import scan_image_archive
from app.models import SecurityScan
from werkzeug.utils import secure_filename

security_bp = Blueprint("security", __name__)


@security_bp.get("/")
def get_security():

    scans = SecurityScan.query.order_by(
        SecurityScan.created_at.desc()
    ).all()

    vulnerabilities = {
        "critical": sum(scan.critical or 0 for scan in scans),
        "high": sum(scan.high or 0 for scan in scans),
        "medium": sum(scan.medium or 0 for scan in scans),
        "low": sum(scan.low or 0 for scan in scans)
    }

    total_vulnerabilities = sum(scan.vulnerabilities_count or 0 for scan in scans
    )

    scanners = {
        "semgrep": "not_scanned",
        "trivy": "not_scanned",
        "checkov": "not_scanned"
    }

    scan_history = []

    scan_types = {
        "trivy": "Container Scan",
        "semgrep": "Code Analysis",
        "checkov": "IaC Scan"
    }

    for scan in scans:
        tool = (scan.tool or "").lower()

        if tool in scanners and scanners[tool] == "not_scanned":
            scanners[tool] = scan.status

        scan_history.append({
            "id": scan.id,
            "tool": scan.tool,
            "target": scan.target,
            "type": scan_types.get(tool, "Security Scan"),
            "status": scan.status,
            "vulnerabilities": scan.vulnerabilities_count or 0,
            "date": (
                scan.created_at.strftime("%d %b %Y")
                if scan.created_at else None
            )
        })

    return jsonify({
        "status": "success",
        "data": {
            "total_vulnerabilities": total_vulnerabilities,
            "scans_count": len(scans),
            "vulnerabilities": vulnerabilities,
            "scanners": scanners,
            "scan_history": scan_history
        }
    }), 200


@security_bp.post("/scan")
def scan_uploaded_image():

    # Limiter la taille du fichier à 200 MB
    if request.content_length and request.content_length > 200 * 1024 * 1024:
        return jsonify({
            "status": "error",
            "message": "File too large. Maximum size is 200 MB."
        }), 413

    # Vérifier la présence du fichier
    if "image" not in request.files:
        return jsonify({
            "status": "error",
            "message": "No image file provided."
        }), 400

    uploaded_file = request.files["image"]

    if not uploaded_file.filename:
        return jsonify({
            "status": "error",
            "message": "No filename provided."
        }), 400

    filename = secure_filename(uploaded_file.filename)

    if not filename.lower().endswith(".tar"):
        return jsonify({
            "status": "error",
            "message": "Only .tar files are accepted."
        }), 400

    try:
        # Créer un dossier temporaire sécurisé
        with tempfile.TemporaryDirectory() as temp_dir:

            archive_path = os.path.join(temp_dir, "image.tar")
            uploaded_file.save(archive_path)

            # Lancer Trivy
            report = scan_image_archive(archive_path)

        # Compter les vulnérabilités
        vulnerabilities = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }

        total = 0

        for result in report.get("Results") or []:
            for vuln in result.get("Vulnerabilities") or []:
                total += 1
                severity = (vuln.get("Severity") or "").lower()

                if severity in vulnerabilities:
                    vulnerabilities[severity] += 1

        # Enregistrer le résultat dans PostgreSQL
        scan = SecurityScan(
            tool="trivy",
            target=filename,
            status="completed",
            vulnerabilities_count=total,
            critical=vulnerabilities["critical"],
            high=vulnerabilities["high"],
            medium=vulnerabilities["medium"],
            low=vulnerabilities["low"]
        )

        db.session.add(scan)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Security scan completed successfully.",
            "data": {
                "scan_id": scan.id,
                "target": filename,
                "total_vulnerabilities": total,
                "vulnerabilities": vulnerabilities
            }
        }), 200

    except Exception:
        db.session.rollback()
        current_app.logger.exception("Trivy scan failed")

        return jsonify({
            "status": "error",
            "message": "Security scan failed. Check backend logs."
        }), 500
