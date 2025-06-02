# backend/Dockerfile

# 1. Use an official Python runtime as a parent image
# Using a slim version for a smaller image size.
# Ensure this Python version matches or is compatible with what your app needs (e.g., 3.10)
FROM --platform=linux/amd64 python:3.10-slim

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy the requirements file into the container at /app
# We'll create this requirements.txt file next
COPY requirements.txt .

# 4. Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade pip -r requirements.txt

# 5. Copy the rest of the application code into the container at /app
COPY . .

# 6. Expose the port the app runs on
EXPOSE 8080

# 7. Define the command to run your application
# "main:app" refers to the 'app' instance in your 'main.py' file.
# "--host", "0.0.0.0" makes the server accessible from outside the container.
# Use the PORT environment variable provided by Cloud Run
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]