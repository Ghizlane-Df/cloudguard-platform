
FROM python:3.14-slim

WORKDIR /app

# Install system dependencies and Trivy
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends wget ca-certificates \
    && wget -q https://github.com/aquasecurity/trivy/releases/download/v0.76.2/trivy_0.76.2_Linux-64bit.deb \
       -O /tmp/trivy.deb \
    && apt-get install -y /tmp/trivy.deb \
    && rm -f /tmp/trivy.deb \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user
RUN groupadd --gid 10001 appuser \
    && useradd --uid 10001 --gid 10001 --no-create-home --shell /usr/sbin/nologin appuser

# Copy application files
COPY --chown=10001:10001 . .

USER 10001:10001

EXPOSE 5000

CMD ["python", "run.py"]
