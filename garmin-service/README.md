# Garmin Service

A FastAPI REST service for retrieving daily step data from Garmin Connect.

## Features

- 🔐 Secure authentication with email/password and MFA support
- 💾 Automatic token storage and refresh (configurable path)
- 📊 Simple REST endpoint for steps data
- 📖 Interactive API documentation (Swagger UI)
- ⚡ Fast and efficient with automatic token refresh
- 🎯 Easy configuration via environment variables

## Requirements

- Python 3.12+
- FastAPI
- Uvicorn
- python-garminconnect
- pydantic-settings

## Installation

### 1. Create Virtual Environment

```bash
cd ~/dev/garmin-service
python -m venv venv
source venv/bin/activate
```

### 2. Install

```bash
pip install -e .
```

### 3. Configuration (Optional)

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure environment variables (all have sensible defaults):

```bash
# Server
GARMIN_API_HOST=127.0.0.1
GARMIN_API_PORT=8000

# Garmin Credentials (optional, for unattended restarts)
# If your service runs on a system that restarts, storing credentials allows
# automatic re-authentication when tokens expire (after 24+ hours)
# WARNING: Only use in trusted environments
# GARMIN_EMAIL=your-email@example.com
# GARMIN_PASSWORD=your-password

# Custom token storage path (defaults to ~/.garminconnect)
GARMIN_TOKEN_PATH=~/.garminconnect

# Token refresh threshold (seconds, defaults to 300 = 5 minutes)
GARMIN_TOKEN_REFRESH_THRESHOLD=300

# Stub mode (optional, use fixed test data instead of calling Garmin API)
# When enabled, the API returns fixed mock data without calling Garmin Connect
# Perfect for development, testing, and CI/CD pipelines - no credentials needed
GARMIN_STUB_MODE=false
```

## Running the Service

### Start the API (Production)

```bash
uvicorn garmin_service.main:app --host 127.0.0.1 --port 8000 --reload
```

### Start the API (Stub Mode - Testing/Development)

To test the API without needing Garmin credentials:

```bash
GARMIN_STUB_MODE=true uvicorn garmin_service.main:app --host 127.0.0.1 --port 8000 --reload
```

Or add to `.env`:
```bash
GARMIN_STUB_MODE=true
```

Then start normally:
```bash
uvicorn garmin_service.main:app --host 127.0.0.1 --port 8000 --reload
```

**Stub mode features:**
- ✅ No authentication required
- ✅ Returns fixed test data regardless of requested date
- ✅ Perfect for testing and development
- ✅ No need for Garmin credentials or tokens

**Production run (normal mode)**: You'll be prompted for:
1. **Email** - Your Garmin Connect email
2. **Password** - Your Garmin Connect password
3. **MFA code** (if enabled) - 6-digit code from your authenticator app

Your tokens will be saved to the configured path (default: `~/.garminconnect/`) for future use.

**Subsequent runs**: Tokens are loaded automatically; no credentials needed.

## Stub Mode

**Option**: `GARMIN_STUB_MODE=true`

**Result**: The API returns fixed mock data without connecting to Garmin. No authentication required, and all endpoints return the same test data regardless of date parameters.

## API Endpoints

### Health Check

Check if the API is running and authenticated:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok",
  "authenticated": true,
  "last_refresh": "2024-12-25T10:30:00+00:00",
  "next_refresh": "2024-12-26T10:30:00+00:00",
  "message": "API ready"
}
```

### Get Steps Data

Retrieve step data for a specific date:

```bash
curl http://localhost:8000/steps/2024-12-25
```

Response:
```json
{
  "date": "2026-04-25",
  "data": [
    {"startGMT":"2026-04-25T04:00:00.0","endGMT":"2026-04-25T04:15:00.0","steps":0},{"startGMT":"2026-04-25T04:15:00.0","endGMT":"2026-04-25T04:30:00.0","steps":0},{"startGMT":"2026-04-25T04:30:00.0","endGMT":"2026-04-25T04:45:00.0","steps":0}
    ...
  ],
  "total_steps": 0,
  "status": "success"
}
```

### Get Daily Steps Range

Retrieve aggregated daily steps data for a date range:

```bash
curl http://localhost:8000/steps/range/2024-12-01/2024-12-31
```

Response:
```json
{
  "start_date": "2024-12-01",
  "end_date": "2024-12-31",
  "data": [
    {"calendarDate": "2024-12-01", "totalSteps": 8234},
    {"calendarDate": "2024-12-02", "totalSteps": 10451},
    {"calendarDate": "2024-12-03", "totalSteps": 9127}
  ],
  "status": "success"
}
```

### Interactive Documentation

Visit the interactive Swagger UI in your browser:

```
http://localhost:8000/docs
```

Or the ReDoc alternative:

```
http://localhost:8000/redoc
```

## Date Format

All dates must be in `YYYY-MM-DD` format:
- ✅ `2024-12-25`
- ❌ `12/25/2024`
- ❌ `2024/12/25`
- ❌ `2024-12-25 10:30:00`

## Configuration File

Token storage path and other settings are configured via `config.py`:

```python
# config.py
class Settings(BaseSettings):
    host: str = os.getenv("GARMIN_API_HOST", "127.0.0.1")
    port: int = int(os.getenv("GARMIN_API_PORT", "8000"))
    token_storage_path: Path = Path(
        os.getenv("GARMIN_TOKEN_PATH", "~/.garminconnect")
    ).expanduser()
    token_refresh_threshold: int = int(
        os.getenv("GARMIN_TOKEN_REFRESH_THRESHOLD", "300")
    )
```

## Token Management

### Automatic Refresh

Tokens are automatically refreshed before each API call if they're expiring soon (default: within 5 minutes).

### Unattended Restarts

If your service runs on a system that may restart after tokens expire (beyond 24 hours):

1. **With stored credentials**: If `GARMIN_EMAIL` and `GARMIN_PASSWORD` are set in `.env`, the service will automatically re-authenticate using them if tokens expire
2. **Without stored credentials**: The service will prompt for manual credentials on startup

### Manual Token Reset

To force re-authentication:

```bash
rm -rf ~/.garminconnect
```

Then restart the service.

## Error Handling

HTTP status codes:
- **200 OK** - Success
- **400 Bad Request** - Invalid date format
- **401 Unauthorized** - Authentication failed
- **429 Too Many Requests** - Rate limited by Garmin
- **500 Internal Error** - Server error
- **503 Service Unavailable** - Cannot reach Garmin API

Error response example:
```json
{
  "status": "error",
  "error": "InvalidDateFormat",
  "message": "Invalid date format",
  "detail": "Date must be in YYYY-MM-DD format"
}
```

## Troubleshooting

### "No valid tokens found"
This is normal on first run. Enter your credentials when prompted.

### "Invalid MFA code"
Ensure the 6-digit code is entered correctly and hasn't expired (usually valid for 30 seconds).

### "Too many login attempts"
Garmin has rate limits. Wait 30 minutes before trying again.

### "Cannot connect to Garmin API"
Check your internet connection or try again later if Garmin's servers are down.

## Acknowledgments

This project uses the excellent [python-garminconnect](https://github.com/cyberjunky/python-garminconnect) library for Garmin Connect integration.

**Credits:** Special thanks to [cyberjunky](https://github.com/cyberjunky) and all contributors to the python-garminconnect project for providing a reliable and well-maintained wrapper around the Garmin Connect API.

## Security Notes

⚠️ **Important**: This service stores your Garmin authentication tokens on disk at `~/.garminconnect/`.

- ✅ Only use this service on machines you trust
- ✅ Keep the `.garminconnect` directory secure
- ✅ Don't share token files with others
- ✅ Rotate credentials if you suspect unauthorized access

### Optional Credential Storage

If you enable `GARMIN_EMAIL` and `GARMIN_PASSWORD` in `.env` for unattended restarts:

- ⚠️ **This is a security trade-off**: Passwords are stored in plain text on disk
- ✅ Only recommended for trusted, isolated systems (home NAS, dedicated server)
- ✅ Ensure your `.env` file has restricted permissions: `chmod 600 .env`
- ✅ Consider using environment variables instead of `.env` files on production systems
- ❌ Never use this on shared or public systems

## License

MIT License

## Support

For issues related to:
- **This API service** - Open an issue on the repository
- **Garmin Connect integration** - See [python-garminconnect](https://github.com/cyberjunky/python-garminconnect)
