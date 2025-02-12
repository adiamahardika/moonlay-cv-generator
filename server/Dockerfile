FROM python:3.10-slim

# Install necessary system packages, including PostgreSQL development libraries
RUN apt-get update

RUN apt-get install -y libreoffice

RUN  apt-get install -y default-jre

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port for Flask
EXPOSE 5180

# Start the Flask application, binding to 0.0.0.0 to accept connections from other containers
CMD ["flask", "run", "--host=0.0.0.0", "--port=5180"]
