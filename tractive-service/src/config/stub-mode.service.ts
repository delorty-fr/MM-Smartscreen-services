import { Injectable, Logger } from '@nestjs/common';

/**
 * Service to manage stub mode configuration
 */
@Injectable()
export class StubModeService {
  private readonly logger = new Logger(StubModeService.name);
  private readonly stubModeEnabled: boolean;

  constructor() {
    this.stubModeEnabled = process.env.STUB_MODE === 'true';

    if (this.stubModeEnabled) {
      this.logger.warn(
        '⚠️  STUB MODE ENABLED - All endpoints except commands will return mock data',
      );
    }
  }

  /**
   * Check if stub mode is enabled
   */
  isStubModeEnabled(): boolean {
    return this.stubModeEnabled;
  }

  /**
   * Check if a route should be stubbed
   * Commands are never stubbed
   */
  shouldStubRoute(path: string): boolean {
    if (!this.stubModeEnabled) {
      return false;
    }

    // Never stub command endpoints
    if (path.includes('/command/')) {
      return false;
    }

    return true;
  }
}
