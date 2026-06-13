FROM python:3.12-slim

WORKDIR /app

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# ✅ Production uchun gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "config.wsgi:application"]