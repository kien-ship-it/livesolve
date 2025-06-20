# backend/Dockerfile

# To build this for Cloud Run on an Apple Silicon Mac, use:
# docker build --platform linux/amd64 -t [YOUR_IMAGE_NAME] .

# 1. Use an official Python runtime as a parent image
...
# 1. Use an official Python runtime as a parent image
# Using a slim version for a smaller image size.
# Ensure this Python version matches or is compatible with what your app needs (e.g., 3.10)
FROM --platform=linux/amd64 python:3.10-slim

# 2. Set the working directory in the container
WORKDIR /app

# 3. Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy the requirements file into the container at /app
# We'll create this requirements.txt file next
COPY requirements.txt .

# 5. Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of the application code into the container at /app
COPY . .

# 7. Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=debug

# 8. Expose the port the app runs on
EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1", "--log-level", "debug"]