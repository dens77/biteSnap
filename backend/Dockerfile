# Backend Dockerfile - Django with Gunicorn
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy project files
COPY . .

# Create directory for static files
RUN mkdir -p /app/static

# Expose port
EXPOSE 8000

# Run migrations and start server (inline)
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && (python manage.py load_ingredients || true) && (python manage.py create_test_data || true) && exec gunicorn --bind 0.0.0.0:8000 --workers 2 --timeout 120 bitesnap.wsgi:application"]

