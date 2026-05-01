import { Injectable, Logger } from '@nestjs/common';
import { getStubData } from './stub-data';

/**
 * Service to provide stub data for different endpoints
 * Reads from stub-data.json file on every request
 */
@Injectable()
export class StubDataProvider {
  private readonly logger = new Logger(StubDataProvider.name);

  /**
   * Get stub data based on the request path
   * Loads fresh data from JSON file on each request
   */
  getStubData(path: string, method: string): any {
    this.logger.debug(`Providing stub data for ${method} ${path}`);

    // Load stub data from JSON file (fresh on every request)
    const stubData = getStubData();

    // Root tractive endpoint - combined info
    if (path === '/tractive' || path.startsWith('/tractive?')) {
      return stubData.STUB_COMBINED_INFO;
    }

    // Auth endpoints
    if (path.includes('/auth')) {
      if (path.includes('is-authenticated')) {
        return true;
      }
      return stubData.STUB_AUTH_DATA;
    }

    // Account endpoints
    if (path.includes('/account')) {
      if (path.includes('/account/info')) {
        return stubData.STUB_ACCOUNT_INFO;
      }
      if (path.includes('/account/subscriptions')) {
        // Check if specific subscription ID
        if (path.match(/\/account\/subscriptions\/[^/]+$/)) {
          return stubData.STUB_SUBSCRIPTION;
        }
        return [stubData.STUB_SUBSCRIPTION];
      }
      return stubData.STUB_ACCOUNT_INFO;
    }

    // Pet endpoints
    if (path.includes('/pet')) {
      if (path.includes('/pet') && path.includes('/health')) {
        return stubData.STUB_PET_HEALTH;
      }
      // Check if specific pet ID
      if (path.match(/\/pet\/[^/]+$/)) {
        return stubData.STUB_PET;
      }
      return [stubData.STUB_PET];
    }

    // Tracker endpoints
    if (path.includes('/tracker')) {
      if (path.includes('/tracker/info')) {
        return stubData.STUB_COMBINED_INFO;
      }
      if (path.includes('/history')) {
        return stubData.STUB_TRACKER_HISTORY;
      }
      // Check if specific tracker ID
      if (path.match(/\/tracker\/[^/]+$/) || path.match(/\/tracker\/[^/]+\//)) {
        return stubData.STUB_TRACKER;
      }
      return [stubData.STUB_TRACKER];
    }

    // Location endpoints
    if (path.includes('/location')) {
      // Check if multiple tracker IDs in path
      if (path.includes(',')) {
        return [stubData.STUB_LOCATION];
      }
      return stubData.STUB_LOCATION;
    }

    // Hardware endpoints
    if (path.includes('/hardware')) {
      if (path.includes('/hardware/battery')) {
        return stubData.STUB_HARDWARE_INFO;
      }
      // Check if multiple tracker IDs
      if (path.includes(',')) {
        return [stubData.STUB_HARDWARE_INFO];
      }
      return stubData.STUB_HARDWARE_INFO;
    }

    // Default
    return {};
  }
}
