"""Pydantic response models for the API."""

from typing import Optional

from pydantic import BaseModel, Field


class StepsDataPoint(BaseModel):
    """Single steps data point."""

    startGMT: Optional[str] = Field(default=None, description="Start time")
    endGMT: Optional[str] = Field(default=None, description="End time")
    steps: Optional[int] = Field(default=None, description="Number of steps")


class StepsResponse(BaseModel):
    """Successful response from /steps endpoint."""

    date: str = Field(description="Date in YYYY-MM-DD format")
    data: list[StepsDataPoint] = Field(description="List of steps data points")
    total_steps: Optional[int] = Field(
        default=None, description="Total steps for the day"
    )
    status: str = Field(default="success", description="Response status")


class DailyStepsEntry(BaseModel):
    """Single day entry with total steps."""

    calendarDate: Optional[str] = Field(description="Date in YYYY-MM-DD format")
    totalSteps: Optional[int] = Field(description="Total steps for the day")


class DailyStepsRangeResponse(BaseModel):
    """Response from /steps/range endpoint."""

    start_date: str = Field(description="Start date in YYYY-MM-DD format")
    end_date: str = Field(description="End date in YYYY-MM-DD format")
    data: list[DailyStepsEntry] = Field(description="List of daily step totals")
    status: str = Field(default="success", description="Response status")


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(description="Service status (ok or error)")
    authenticated: bool = Field(description="Is the service authenticated")
    last_refresh: Optional[str] = Field(
        default=None, description="ISO timestamp of last token refresh"
    )
    next_refresh: Optional[str] = Field(
        default=None, description="ISO timestamp of expected next refresh"
    )
    message: Optional[str] = Field(default=None, description="Additional status message")


class ErrorResponse(BaseModel):
    """Error response."""

    status: str = Field(default="error", description="Response status")
    error: str = Field(description="Error type")
    message: str = Field(description="Error message")
    detail: Optional[str] = Field(default=None, description="Additional error details")
