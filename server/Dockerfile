# Backend Dockerfile (server/Dockerfile)
FROM python:3.10-slim

# Install necessary system packages, including PostgreSQL development libraries
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libreoffice-core \
    libreoffice-writer \
    postgresql-client \
    libpq-dev \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port for Flask
EXPOSE 5000

# Set working directory
WORKDIR /app

# Start the Flask application
CMD ["python", "app.py"]
