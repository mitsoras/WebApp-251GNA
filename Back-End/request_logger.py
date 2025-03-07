import logging
from logging.handlers import TimedRotatingFileHandler
import os
from datetime import datetime, timezone
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import json

# Define the directory for logs
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Set up the log file with daily rotation
log_file = os.path.join(LOG_DIR, "app_log.log")  # Fixed base name; rotation will handle dates
handler = TimedRotatingFileHandler(
    log_file, when="midnight", interval=1, backupCount=7  # Rotate daily and keep 7 days of logs
)

# JSON formatter for structured logs
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
        }
        return json.dumps(log_record)

log_formatter = JSONFormatter()
handler.setFormatter(log_formatter)

# Set up the logger
logger = logging.getLogger("request_logger")
logger.setLevel(logging.INFO)
logger.addHandler(handler)

# Define a maximum length for logging request bodies
MAX_BODY_LENGTH = 1000


# Middleware to log requests and responses
async def log_requests(request: Request, call_next):
    # Generate a unique request ID
    request_id = str(uuid.uuid4())
    start_time = datetime.now(timezone.utc)

    # Capture client IP
    client_ip = request.client.host if request.client else "Unknown"

    # Capture and truncate request body
    try:
        request_body = await request.json()
        if isinstance(request_body, dict) or isinstance(request_body, list):
            request_body = json.dumps(request_body)
        if len(request_body) > MAX_BODY_LENGTH:
            request_body = request_body[:MAX_BODY_LENGTH] + "... (truncated)"
    except Exception:
        request_body = "Non-JSON or empty body"

    # Log request details
    logger.info({
        "request_id": request_id,
        "client_ip": client_ip,
        "method": request.method,
        "url": str(request.url),
        "request_body": request_body,
        "start_time": start_time.isoformat(),
    })

    # Process the request and capture the response
    response = await call_next(request)

    # Calculate request duration
    duration = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000  # ms

    # Log response details
    logger.info({
        "request_id": request_id,
        "client_ip": client_ip,
        "method": request.method,
        "url": str(request.url),
        "status_code": response.status_code,
        "duration_ms": duration,
    })

    return response


# Middleware wrapper class for easier integration
class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        return await log_requests(request, call_next)
