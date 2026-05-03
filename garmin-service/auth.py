"""Authentication manager for Garmin Connect."""

import logging
from datetime import UTC, datetime, timedelta
from getpass import getpass
from pathlib import Path
from typing import Optional

from garminconnect import (
    Garmin,
    GarminConnectAuthenticationError,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
)

logger = logging.getLogger(__name__)


def _get_mfa_code() -> str:
    """Prompt user for MFA code."""
    while True:
        try:
            mfa_code = input("Enter MFA code (digits only): ").strip()
            if len(mfa_code) == 6 and mfa_code.isdigit():
                return mfa_code
            print("❌ MFA code must be 6 digits. Please try again.")
        except KeyboardInterrupt:
            raise


class GarminAuthManager:
    """Manages Garmin Connect authentication with token storage and refresh."""

    def __init__(self, token_storage_path: Path, email: str = "", password: str = ""):
        """Initialize the authentication manager.

        Args:
            token_storage_path: Path to store tokens (~/.garminconnect)
            email: Optional email for fallback login
            password: Optional password for fallback login
        """
        self.token_storage_path = token_storage_path
        self.fallback_email = email
        self.fallback_password = password
        self.garmin_client: Optional[Garmin] = None
        self.last_refresh: Optional[datetime] = None
        self.next_expected_refresh: Optional[datetime] = None
        
        # Log if fallback credentials are available
        if self.fallback_email:
            logger.info("✅ Fallback credentials loaded from environment")
        else:
            logger.info("⚠️  No fallback credentials configured in environment")

    def login(
        self, email: Optional[str] = None, password: Optional[str] = None
    ) -> Garmin:
        """Perform login with stored tokens or credentials.

        Attempts to login using stored tokens first. If that fails,
        prompts for email/password and handles MFA if needed.

        Args:
            email: Optional email for login (if None, will be prompted)
            password: Optional password for login (if None, will be prompted)

        Returns:
            Authenticated Garmin client instance

        Raises:
            GarminConnectTooManyRequestsError: Too many login attempts
            GarminConnectAuthenticationError: Authentication failed
        """
        # Try to login with stored tokens first
        try:
            logger.info(
                f"Attempting to login using stored tokens from: {self.token_storage_path}"
            )
            self.garmin_client = Garmin()
            self.garmin_client.login(str(self.token_storage_path))
            logger.info("✅ Successfully logged in using stored tokens")
            
            # Initialize display_name to prevent "Display name is not set" errors
            self._initialize_display_name()
            
            self._update_refresh_time()
            return self.garmin_client

        except GarminConnectTooManyRequestsError as err:
            logger.error(f"❌ Too many login attempts: {err}")
            raise

        except (
            FileNotFoundError,
            GarminConnectAuthenticationError,
            GarminConnectConnectionError,
        ):
            logger.info("No valid tokens found. Using login credentials...")

        # Loop for credential entry with retry on auth failure
        while True:
            try:
                # Get credentials if not provided
                # 1. Use fallback credentials if available (from env)
                # 2. Otherwise use provided email/password
                # 3. Otherwise prompt user
                if not email and self.fallback_email:
                    email = self.fallback_email
                    password = self.fallback_password
                    logger.info("Using stored credentials from environment variables")
                elif not email or not password:
                    email = input("📧 Email address: ").strip()
                    password = getpass("🔐 Password: ")

                logger.info("Logging in with credentials...")
                self.garmin_client = Garmin(
                    email=email, password=password, is_cn=False, return_on_mfa=True
                )
                result1, result2 = self.garmin_client.login()

                if result1 == "needs_mfa":
                    logger.info("Multi-factor authentication required")
                    mfa_code = _get_mfa_code()
                    logger.info("🔄 Submitting MFA code...")

                    try:
                        self.garmin_client.resume_login(result2, mfa_code)
                        logger.info("✅ MFA authentication successful!")

                    except GarminConnectTooManyRequestsError:
                        logger.error(
                            "❌ Too many MFA attempts. Please wait 30 minutes before trying again."
                        )
                        raise

                    except GarminConnectAuthenticationError as mfa_error:
                        error_str = str(mfa_error)
                        if "401" in error_str or "403" in error_str:
                            logger.warning(
                                "❌ Invalid MFA code. Please verify and try again."
                            )
                            email = None
                            password = None
                            continue
                        logger.error(f"❌ MFA authentication failed: {mfa_error}")
                        raise

                # Save tokens for future use
                self.token_storage_path.parent.mkdir(parents=True, exist_ok=True)
                self.garmin_client.client.dump(str(self.token_storage_path))
                logger.info(f"✅ Login successful! Tokens saved to: {self.token_storage_path}")
                
                # Initialize display_name to prevent "Display name is not set" errors
                self._initialize_display_name()
                
                self._update_refresh_time()

                return self.garmin_client

            except GarminConnectTooManyRequestsError as err:
                logger.error(f"❌ {err}")
                raise

            except GarminConnectAuthenticationError as err:
                logger.error(f"❌ {err}")
                logger.info("💡 Please check your username and password and try again")
                email = None
                password = None
                continue

    def refresh_if_needed(self, threshold_seconds: int = 300) -> bool:
        """Refresh authentication token if it's expiring soon.

        Args:
            threshold_seconds: Refresh if token expires within this many seconds

        Returns:
            True if refresh was needed and successful, False if no refresh needed

        Raises:
            GarminConnectAuthenticationError: Token refresh failed
        """
        if not self.garmin_client:
            raise RuntimeError("Not authenticated. Call login() first.")

        now = datetime.now(UTC)

        # If next_expected_refresh is set and we're not near it yet, skip
        if self.next_expected_refresh and now < (
            self.next_expected_refresh - timedelta(seconds=threshold_seconds)
        ):
            return False

        logger.info("🔄 Refreshing authentication tokens...")
        try:
            self.garmin_client.client._refresh_session()
            # Save refreshed tokens to disk
            self.garmin_client.client.dump(str(self.token_storage_path))
            
            # Re-initialize display_name to ensure it's properly set after token refresh
            self._initialize_display_name()
            
            self._update_refresh_time()
            logger.info("✅ Tokens refreshed successfully")
            return True

        except Exception as err:
            logger.error(f"❌ Token refresh failed: {err}")
            
            # If refresh fails and we have stored credentials, attempt re-login
            if self.fallback_email and self.fallback_password:
                logger.info("💡 Token refresh failed. Attempting re-login with stored credentials...")
                try:
                    self.login(self.fallback_email, self.fallback_password)
                    logger.info("✅ Successfully re-authenticated with stored credentials")
                    return True
                except Exception as reauth_err:
                    logger.error(f"❌ Re-authentication also failed: {reauth_err}")
                    raise GarminConnectAuthenticationError(
                        f"Token refresh failed and re-authentication failed: {reauth_err}"
                    ) from reauth_err
            else:
                raise GarminConnectAuthenticationError(
                    f"Token refresh failed: {err}"
                ) from err

    def _update_refresh_time(self) -> None:
        """Update refresh timestamps."""
        self.last_refresh = datetime.now(UTC)
        # Assume tokens are valid for ~24 hours, refresh every ~12 hours
        self.next_expected_refresh = self.last_refresh + timedelta(hours=12)
        logger.debug(
            f"Refresh time updated. Next refresh expected at: {self.next_expected_refresh.isoformat()}"
        )

    def _initialize_display_name(self) -> None:
        """Fetch and set the display_name on the Garmin client.
        
        The Garmin API requires display_name to be set. This fetches it from the
        user profile and ensures it's available for subsequent API calls.
        
        Raises:
            GarminConnectConnectionError: If unable to fetch user profile
        """
        if not self.garmin_client:
            logger.warning("Cannot initialize display_name: client not authenticated")
            return
        
        try:
            # Fetch the user's social profile
            prof = self.garmin_client.client.connectapi(
                "/userprofile-service/socialProfile"
            )
            
            if isinstance(prof, dict):
                display_name = prof.get("displayName")
                if display_name:
                    self.garmin_client.display_name = display_name
                    logger.info(f"✅ Display name initialized: {display_name}")
                else:
                    # Fallback to username if displayName is not available
                    fallback_name = prof.get("username") or self.garmin_client.username
                    self.garmin_client.display_name = fallback_name
                    logger.warning(
                        f"⚠️  No displayName in profile, using fallback: {fallback_name}"
                    )
            else:
                logger.warning("Unexpected profile response format, skipping display_name initialization")
                
        except Exception as e:
            logger.warning(f"Could not initialize display_name from profile: {e}")
            # Fallback to username if profile fetch fails
            if hasattr(self.garmin_client, 'username'):
                self.garmin_client.display_name = self.garmin_client.username
                logger.info(f"Using username as fallback display_name: {self.garmin_client.username}")

    def get_client(self) -> Garmin:
        """Get the authenticated Garmin client.

        Returns:
            Garmin client instance

        Raises:
            RuntimeError: If not authenticated
        """
        if not self.garmin_client:
            raise RuntimeError("Not authenticated. Call login() first.")
        return self.garmin_client
