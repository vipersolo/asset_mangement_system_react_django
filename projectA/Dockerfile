# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# defaults to 8000.
ENV PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Collect static files for production
RUN python manage.py collectstatic --noinput

# Run using Gunicorn (Industry standard for production)
CMD ["sh", "-c", "python manage.py migrate --noinput && python setup_roles.py && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:$PORT asset_management.wsgi:application"]
