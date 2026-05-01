# Plan: REST API Backend for Garmin Steps Data

## TL;DR
Build a FastAPI service that exposes a single REST endpoint (`GET /steps/{date}`) to retrieve daily step counts. The service will authenticate once on startup (interactive prompt), store tokens on disk, and auto-refresh them before each API call—using the same authentication pattern as demo.py.

---

## Steps

### Phase 1: Project Setup

1. Create new FastAPI service directory (`garmin-service`) under `~/dev/`
2. Add FastAPI dependency to `pyproject.toml` (FastAPI + Uvicorn for local serving)
3. Initialize basic FastAPI app with startup/shutdown lifecycle hooks

### Phase 2: Authentication & Token Management (Startup)

4. Create `GarminAuthManager` class to handle:
   - Initial interactive login on startup (email + password prompt)
   - MFA support (if needed during startup)
   - Token storage to `~/.garminconnect/` (same as demo.py)
   - Auto-load existing tokens if valid, skip login prompt
   
5. Implement FastAPI `lifespan` context manager to:
   - Trigger login on app startup (one-time)
   - Store authenticated `Garmin` client instance globally
   - Handle authentication errors gracefully

### Phase 3: REST Endpoint

6. Create `GET /steps/{date}` endpoint:
   - Accept date in `YYYY-MM-DD` format (query validation)
   - Call `api.get_steps_data(date)` 
   - Return JSON with step data or error response
   - Include proper HTTP status codes (200, 400, 401, 500)

### Phase 4: Token Refresh Strategy

7. Implement automatic token refresh:
   - Before each API call in the endpoint, refresh if token expires soon
   - Reuse `garmin.client._refresh_session()` method
   - Save refreshed tokens back to disk
   - Handle refresh failures gracefully (return 503 if refresh fails)

### Phase 5: Error Handling & Responses

8. Create standardized error response class:
   - Map Garmin exceptions to HTTP status codes
   - GarminConnectAuthenticationError → 401
   - GarminConnectConnectionError → 503
   - Invalid date format → 400
   
9. Add logging for debugging and monitoring

### Phase 6: Documentation & Testing

10. Add OpenAPI docstrings to endpoint (FastAPI auto-generates Swagger docs)
11. Create example usage in docstring
12. Optional: Add basic health check endpoint (`GET /health`)

---

## User Requirements (Implemented)

✅ **Config file**: Token storage path and other settings defined in `config.py`, loaded from environment variables
✅ **No rate limiting**: Service lets Garmin API errors propagate naturally
✅ **Health endpoint**: `GET /health` returns auth status and next token refresh time
✅ **New folder**: Project created under `~/dev/garmin-service`
✅ **README**: Complete installation and usage guide with credit to python-garminconnect

---

## Relevant Files

- `garminconnect/__init__.py` — `Garmin` class with `get_steps_data()` and token refresh logic
- `garminconnect/client.py` — `Client._refresh_session()` for token auto-refresh
- `demo.py` — Reference for authentication flow and error handling patterns (lines 4293–4370 for `init_api()`)
- `pyproject.toml` — Add FastAPI dependency

---

## Project Structure

```
~/dev/garmin-service/
├── pyproject.toml              # Dependencies and project metadata
├── config.py                   # Configuration management (token path from env)
├── auth.py                     # GarminAuthManager class
├── models.py                   # Pydantic response models
├── .env.example                # Example environment configuration
├── README.md                   # Installation and usage guide
├── garmin_service/
│   ├── __init__.py
│   └── main.py                # FastAPI application
```

---

## File Descriptions

### `config.py`
- `Settings` class with Pydantic BaseSettings
- `token_storage_path` from `GARMIN_TOKEN_PATH` env var (default: `~/.garminconnect`)
- `host`, `port`, `token_refresh_threshold` all configurable

### `auth.py`
- `GarminAuthManager` class handles authentication lifecycle
- Tries stored tokens first, then prompts for email/password
- Supports MFA with `_get_mfa_code()` function
- `refresh_if_needed()` method for proactive token refresh
- Tracks `last_refresh` and `next_expected_refresh` timestamps

### `models.py`
- `StepsDataPoint` - Single data point from Garmin
- `StepsResponse` - Successful `/steps/{date}` response
- `HealthResponse` - Status, auth state, refresh times
- `ErrorResponse` - Standardized error format

### `garmin_service/main.py`
- FastAPI app with `lifespan` context manager
- `GET /health` - Returns HealthResponse with auth status and refresh times
- `GET /steps/{date}` - Returns steps data with error handling
- Automatic token refresh before each request
- Proper HTTP status code mapping

---

## Verification

1. **Manual Testing**: Start service, hit `/steps/2024-12-25`, verify step data returned
2. **Token Refresh**: Check logs that auto-refresh happens before API calls
3. **Error Cases**: Invalid date format, network error, Garmin API 401
4. **API Docs**: Open `http://localhost:8000/docs` in browser (FastAPI Swagger UI)
5. **Health endpoint**: `curl http://localhost:8000/health` shows auth status and next refresh time

---

## Decisions

- **No REST API authentication**: Service is open (suitable for local/internal use)
- **Single account**: Simpler design; supports one Garmin credential at a time
- **File system tokens**: Reuses existing token storage pattern from demo.py
- **Interactive startup**: Credential prompt on first run; subsequent runs use stored tokens
- **Auto-refresh before requests**: Prevents 401 errors mid-request by proactively refreshing expiring tokens
- **Config via environment**: All settings can be overridden with env vars (GARMIN_* prefix)
