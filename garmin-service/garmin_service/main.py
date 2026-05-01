"""FastAPI application for Garmin Steps Data REST API."""

import logging
import re
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from garminconnect import (
    GarminConnectAuthenticationError,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
)

# Add parent directory to path so we can import config, auth, models
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import settings
from auth import GarminAuthManager
from models import ErrorResponse, HealthResponse, StepsResponse, StepsDataPoint, DailyStepsRangeResponse, DailyStepsEntry

# Stub data for testing without Garmin API
STUB_STEPS_DATA = [
    {"startGMT": "2026-04-28T04:00:00.0", "endGMT": "2026-04-28T04:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T04:15:00.0", "endGMT": "2026-04-28T04:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T04:30:00.0", "endGMT": "2026-04-28T04:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T04:45:00.0", "endGMT": "2026-04-28T05:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T05:00:00.0", "endGMT": "2026-04-28T05:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T05:15:00.0", "endGMT": "2026-04-28T05:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T05:30:00.0", "endGMT": "2026-04-28T05:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T05:45:00.0", "endGMT": "2026-04-28T06:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T06:00:00.0", "endGMT": "2026-04-28T06:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T06:15:00.0", "endGMT": "2026-04-28T06:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T06:30:00.0", "endGMT": "2026-04-28T06:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T06:45:00.0", "endGMT": "2026-04-28T07:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T07:00:00.0", "endGMT": "2026-04-28T07:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T07:15:00.0", "endGMT": "2026-04-28T07:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T07:30:00.0", "endGMT": "2026-04-28T07:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T07:45:00.0", "endGMT": "2026-04-28T08:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T08:00:00.0", "endGMT": "2026-04-28T08:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T08:15:00.0", "endGMT": "2026-04-28T08:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T08:30:00.0", "endGMT": "2026-04-28T08:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T08:45:00.0", "endGMT": "2026-04-28T09:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T09:00:00.0", "endGMT": "2026-04-28T09:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T09:15:00.0", "endGMT": "2026-04-28T09:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T09:30:00.0", "endGMT": "2026-04-28T09:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T09:45:00.0", "endGMT": "2026-04-28T10:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T10:00:00.0", "endGMT": "2026-04-28T10:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T10:15:00.0", "endGMT": "2026-04-28T10:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T10:30:00.0", "endGMT": "2026-04-28T10:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T10:45:00.0", "endGMT": "2026-04-28T11:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T11:00:00.0", "endGMT": "2026-04-28T11:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T11:15:00.0", "endGMT": "2026-04-28T11:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T11:30:00.0", "endGMT": "2026-04-28T11:45:00.0", "steps": 149},
    {"startGMT": "2026-04-28T11:45:00.0", "endGMT": "2026-04-28T12:00:00.0", "steps": 21},
    {"startGMT": "2026-04-28T12:00:00.0", "endGMT": "2026-04-28T12:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T12:15:00.0", "endGMT": "2026-04-28T12:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T12:30:00.0", "endGMT": "2026-04-28T12:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T12:45:00.0", "endGMT": "2026-04-28T13:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T13:00:00.0", "endGMT": "2026-04-28T13:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T13:15:00.0", "endGMT": "2026-04-28T13:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T13:30:00.0", "endGMT": "2026-04-28T13:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T13:45:00.0", "endGMT": "2026-04-28T14:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T14:00:00.0", "endGMT": "2026-04-28T14:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T14:15:00.0", "endGMT": "2026-04-28T14:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T14:30:00.0", "endGMT": "2026-04-28T14:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T14:45:00.0", "endGMT": "2026-04-28T15:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T15:00:00.0", "endGMT": "2026-04-28T15:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T15:15:00.0", "endGMT": "2026-04-28T15:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T15:30:00.0", "endGMT": "2026-04-28T15:45:00.0", "steps": 0},
    {"startGMT": "2026-04-28T15:45:00.0", "endGMT": "2026-04-28T16:00:00.0", "steps": 0},
    {"startGMT": "2026-04-28T16:00:00.0", "endGMT": "2026-04-28T16:15:00.0", "steps": 0},
    {"startGMT": "2026-04-28T16:15:00.0", "endGMT": "2026-04-28T16:30:00.0", "steps": 0},
    {"startGMT": "2026-04-28T16:30:00.0", "endGMT": "2026-04-28T16:45:00.0", "steps": 0},
]

STUB_DAILY_STEPS = [
    {"calendarDate": "2026-04-21", "totalSteps": 8234},
    {"calendarDate": "2026-04-22", "totalSteps": 10451},
    {"calendarDate": "2026-04-23", "totalSteps": 9127},
    {"calendarDate": "2026-04-24", "totalSteps": 7845},
    {"calendarDate": "2026-04-25", "totalSteps": 11230},
    {"calendarDate": "2026-04-26", "totalSteps": 9876},
    {"calendarDate": "2026-04-27", "totalSteps": 10432},
]

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Global auth manager
auth_manager: GarminAuthManager | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for app startup and shutdown."""
    global auth_manager

    # Startup
    logger.info("🚀 Garmin Service starting up...")
    logger.debug(f"Settings loaded - Email: {settings.email if settings.email else 'NOT SET'}")
    
    if settings.stub_mode:
        logger.info("📋 STUB MODE ENABLED - Using fixed test data")
        auth_manager = None  # Skip authentication in stub mode
        logger.info("✅ Stub mode ready. API will return fixed data for all requests.")
    else:
        auth_manager = GarminAuthManager(
            settings.token_storage_path,
            email=settings.email,
            password=settings.password,
        )

        try:
            logger.info("Authenticating with Garmin Connect...")
            auth_manager.login()
            logger.info("✅ Authentication successful. API is ready to serve requests.")
        except GarminConnectTooManyRequestsError:
            logger.error("❌ Too many login attempts. Please try again later.")
            raise
        except (GarminConnectAuthenticationError, GarminConnectConnectionError) as err:
            logger.error(f"❌ Authentication failed: {err}")
            raise

    yield

    # Shutdown
    logger.info("🛑 Garmin Service shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Garmin Service",
    description="REST API service to retrieve daily step data from Garmin Connect",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Check API health and authentication status.

    Returns:
        HealthResponse with status, authentication state, and refresh times
    """
    if settings.stub_mode:
        return HealthResponse(
            status="ok",
            authenticated=True,
            message="API ready (STUB MODE - using fixed test data)",
        )
    
    if not auth_manager or not auth_manager.garmin_client:
        return HealthResponse(
            status="error",
            authenticated=False,
            message="Not authenticated",
        )

    return HealthResponse(
        status="ok",
        authenticated=True,
        last_refresh=auth_manager.last_refresh.isoformat()
        if auth_manager.last_refresh
        else None,
        next_refresh=auth_manager.next_expected_refresh.isoformat()
        if auth_manager.next_expected_refresh
        else None,
        message="API ready",
    )


@app.get("/steps/{date}", response_model=StepsResponse)
async def get_steps(date: str) -> StepsResponse:
    """Get steps data for a specific date.

    Args:
        date: Date in YYYY-MM-DD format

    Returns:
        StepsResponse with step data for the requested date

    Raises:
        HTTPException: On validation, authentication, or connection errors

    Example:
        GET /steps/2024-12-25
    """
    # Validate date format
    date_pattern = r"^\d{4}-\d{2}-\d{2}$"
    if not re.match(date_pattern, date):
        logger.warning(f"❌ Invalid date format: {date}")
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "error": "InvalidDateFormat",
                "message": "Invalid date format",
                "detail": "Date must be in YYYY-MM-DD format",
            },
        )

    # Stub mode: return fixed data regardless of the date
    if settings.stub_mode:
        logger.info(f"📋 STUB MODE: Returning fixed steps data (date requested: {date})")
        total_steps = sum(entry.get("steps", 0) for entry in STUB_STEPS_DATA)
        processed_data = [
            StepsDataPoint(
                startGMT=entry["startGMT"],
                endGMT=entry["endGMT"],
                steps=entry["steps"],
            )
            for entry in STUB_STEPS_DATA
        ]
        logger.debug(f"Processed {len(processed_data)} stub data points, total_steps: {total_steps}")
        return StepsResponse(
            date=date,
            data=processed_data,
            total_steps=total_steps,
            status="success",
        )

    if not auth_manager or not auth_manager.garmin_client:
        logger.error("❌ Not authenticated")
        raise HTTPException(
            status_code=401,
            detail={
                "status": "error",
                "error": "NotAuthenticated",
                "message": "API is not authenticated",
            },
        )

    try:
        # Refresh tokens if needed
        logger.info("🔄 Checking if token refresh is needed...")
        auth_manager.refresh_if_needed(threshold_seconds=settings.token_refresh_threshold)

        # Fetch steps data
        logger.info(f"📊 Fetching steps data for {date}")
        steps_data = auth_manager.garmin_client.get_steps_data(date)

        # Calculate total steps and process data
        total_steps = 0
        processed_data = []

        for entry in steps_data:
            if isinstance(entry, dict):
                steps = entry.get("steps", 0)
                if steps:
                    total_steps += steps
                # Only extract startGMT, endGMT, and steps
                processed_data.append(
                    StepsDataPoint(
                        startGMT=entry.get("startGMT"),
                        endGMT=entry.get("endGMT"),
                        steps=steps,
                    )
                )

        logger.info(
            f"✅ Successfully retrieved {len(processed_data)} data points for {date}"
        )

        return StepsResponse(
            date=date,
            data=processed_data,
            total_steps=total_steps,
            status="success",
        )

    except GarminConnectAuthenticationError as err:
        logger.error(f"❌ Authentication error: {err}")
        raise HTTPException(
            status_code=401,
            detail={
                "status": "error",
                "error": "AuthenticationError",
                "message": "Authentication failed",
                "detail": str(err),
            },
        )

    except GarminConnectConnectionError as err:
        logger.error(f"❌ Connection error: {err}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "error": "ConnectionError",
                "message": "Failed to connect to Garmin API",
                "detail": str(err),
            },
        )

    except GarminConnectTooManyRequestsError as err:
        logger.error(f"❌ Too many requests: {err}")
        raise HTTPException(
            status_code=429,
            detail={
                "status": "error",
                "error": "TooManyRequests",
                "message": "Too many requests to Garmin API",
                "detail": "Please wait before retrying",
            },
        )

    except Exception as err:
        logger.error(f"❌ Unexpected error: {err}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": "InternalServerError",
                "message": "An unexpected error occurred",
                "detail": str(err),
            },
        )


@app.get("/steps/range/{start_date}/{end_date}", response_model=DailyStepsRangeResponse)
async def get_steps_range(start_date: str, end_date: str) -> DailyStepsRangeResponse:
    """Get daily steps for a date range.

    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format

    Returns:
        DailyStepsRangeResponse with daily step totals for the range

    Raises:
        HTTPException: On validation, authentication, or connection errors

    Example:
        GET /steps/range/2024-12-20/2024-12-25
    """
    # Validate date format
    date_pattern = r"^\d{4}-\d{2}-\d{2}$"
    if not re.match(date_pattern, start_date):
        logger.warning(f"❌ Invalid start date format: {start_date}")
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "error": "InvalidDateFormat",
                "message": "Invalid date format",
                "detail": "Start date must be in YYYY-MM-DD format",
            },
        )

    if not re.match(date_pattern, end_date):
        logger.warning(f"❌ Invalid end date format: {end_date}")
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "error": "InvalidDateFormat",
                "message": "Invalid date format",
                "detail": "End date must be in YYYY-MM-DD format",
            },
        )

    # Stub mode: return fixed data regardless of the dates
    if settings.stub_mode:
        logger.info(
            f"📋 STUB MODE: Returning fixed daily steps data (range: {start_date} to {end_date})"
        )
        processed_data = [
            DailyStepsEntry(
                calendarDate=entry.get("calendarDate"),
                totalSteps=entry.get("totalSteps"),
            )
            for entry in STUB_DAILY_STEPS
        ]
        return DailyStepsRangeResponse(
            start_date=start_date,
            end_date=end_date,
            data=processed_data,
            status="success",
        )

    if not auth_manager or not auth_manager.garmin_client:
        logger.error("❌ Not authenticated")
        raise HTTPException(
            status_code=401,
            detail={
                "status": "error",
                "error": "NotAuthenticated",
                "message": "API is not authenticated",
            },
        )

    try:
        # Refresh tokens if needed
        logger.info("🔄 Checking if token refresh is needed...")
        auth_manager.refresh_if_needed(threshold_seconds=settings.token_refresh_threshold)

        # Fetch daily steps data for range
        logger.info(f"📊 Fetching daily steps data for range {start_date} to {end_date}")
        daily_steps_data = auth_manager.garmin_client.get_daily_steps(start_date, end_date)

        # Process data
        processed_data = []
        for entry in daily_steps_data:
            if isinstance(entry, dict):
                processed_data.append(
                    DailyStepsEntry(
                        calendarDate=entry.get("calendarDate"),
                        totalSteps=entry.get("totalSteps", 0),
                    )
                )

        logger.info(
            f"✅ Successfully retrieved {len(processed_data)} days for range {start_date} to {end_date}"
        )

        return DailyStepsRangeResponse(
            start_date=start_date,
            end_date=end_date,
            data=processed_data,
            status="success",
        )

    except GarminConnectAuthenticationError as err:
        logger.error(f"❌ Authentication error: {err}")
        raise HTTPException(
            status_code=401,
            detail={
                "status": "error",
                "error": "AuthenticationError",
                "message": "Authentication failed",
                "detail": str(err),
            },
        )

    except GarminConnectConnectionError as err:
        logger.error(f"❌ Connection error: {err}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "error": "ConnectionError",
                "message": "Failed to connect to Garmin API",
                "detail": str(err),
            },
        )

    except GarminConnectTooManyRequestsError as err:
        logger.error(f"❌ Too many requests: {err}")
        raise HTTPException(
            status_code=429,
            detail={
                "status": "error",
                "error": "TooManyRequests",
                "message": "Too many requests to Garmin API",
                "detail": "Please wait before retrying",
            },
        )

    except Exception as err:
        logger.error(f"❌ Unexpected error: {err}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": "InternalServerError",
                "message": "An unexpected error occurred",
                "detail": str(err),
            },
        )


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint - redirects to API documentation."""
    return {
        "message": "Garmin Service",
        "docs": "http://localhost:8000/docs",
        "openapi": "http://localhost:8000/openapi.json",
    }
