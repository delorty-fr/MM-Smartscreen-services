import { Controller, Get, HttpStatus, Logger, Query } from '@nestjs/common';
import { TrackerService } from './modules/tracker/tracker.service';
import { TractiveCombinedInfo } from './interfaces/tractive-combined-info.interface';
import { ApiResponse } from './interfaces/api-response';
import { AxiosError } from 'axios';

/**
 * Root controller for the Tractive API
 */
@Controller()
export class RootController {
  private readonly logger = new Logger(RootController.name);

  constructor(private readonly trackerService: TrackerService) {}

  /**
   * Get combined tracker information including pet, tracker, hardware, and location data
   * Query params: trackerId (required), petID (optional)
   * @example GET /tractive?trackerId=abc123&petID=pet456
   */
  @Get('tractive')
  async getCombinedInfo(
    @Query('trackerId') trackerId: string,
    @Query('petID') petID?: string,
  ): Promise<ApiResponse<TractiveCombinedInfo>> {
    try {
      const data = await this.trackerService.getCombinedInfo(trackerId, petID);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorMessage = e?.message;

      if (e instanceof AxiosError) {
        status = e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        // Extract error message from Tractive API response if available
        if (e.response?.data) {
          errorMessage = e.response.data.error || e.response.data.message || e.message;
        }
      }
      this.logger.error(`Error while getting combined info: ${errorMessage}`);
      return {
        status,
        data: null,
        message: errorMessage,
      };
    }
  }
}
