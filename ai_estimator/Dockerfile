FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY ai_estimator/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ai_estimator ./ai_estimator

EXPOSE 8100

CMD ["uvicorn", "ai_estimator.app.main:app", "--host", "0.0.0.0", "--port", "8100"]
