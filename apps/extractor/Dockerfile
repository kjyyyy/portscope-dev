FROM python:3.12-slim

WORKDIR /app

COPY apps/extractor/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/extractor/src ./src

ENV PYTHONPATH=/app
EXPOSE 8001
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8001"]
