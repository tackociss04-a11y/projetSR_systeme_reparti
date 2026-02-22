FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --default-timeout=300 --no-cache-dir -r requirements.txt
EXPOSE 5000
CMD ["python", "app.py"]
ENV PYTHONPATH=/app