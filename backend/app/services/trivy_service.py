
import json
import subprocess
import tempfile
from pathlib import Path
import tarfile
import shutil


def scan_image_archive(archive_path):
    """
    Lance Trivy sur une archive Docker (.tar)
    et retourne les résultats au format JSON.
    """

    archive = Path(archive_path).resolve()

    if not archive.is_file():
        raise FileNotFoundError("Image archive not found")

    if not tarfile.is_tarfile(archive):
        raise ValueError("Invalid TAR archive")

    trivy_path = shutil.which("trivy")

    if trivy_path is None:
        raise RuntimeError("Trivy executable not found")

    with tempfile.NamedTemporaryFile(
        suffix=".json",
        delete=False
    ) as report:
        report_path = report.name

    try:
        command = [
            trivy_path,
            "image",
            "--input", str(archive),
            "--scanners", "vuln",
            "--format", "json",
            "--output", report_path
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=600,
            check=False,
            shell=False
        )

        if result.returncode != 0:
            raise RuntimeError(
                result.stderr or "Trivy scan failed"
            )

        with open(report_path, "r", encoding="utf-8") as file:
            return json.load(file)

    finally:
        Path(report_path).unlink(missing_ok=True)
