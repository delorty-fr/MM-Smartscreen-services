import { Controller, Get, HttpStatus, Logger, Param, Query, Body } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import {
  TractiveTracker,
} from '../../interfaces/tractive-tracker.interface';
import { TractivePositionHistory } from '../../interfaces/tractive-position-history.interface';
import { TractiveCombinedInfo } from '../../interfaces/tractive-combined-info.interface';
import { ApiResponse } from '../../interfaces/api-response';
import { TrackerHistoryDto } from '../../dto/tracker-history.dto';
import { AxiosError } from 'axios';

/**
 * Controller for tracker-related operations.
 */
@Controller({
  path: 'tracker',
})
export class TrackerController {
  private readonly logger = new Logger(TrackerController.name);

  constructor(private readonly trackerService: TrackerService) {}

  /**
   * Get all trackers
   */
  @Get()
  async getAllTrackers(): Promise<ApiResponse<TractiveTracker[]>> {
    try {
      const data = await this.trackerService.getAllTrackers();
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting all trackers: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Get combined tracker information including pet, tracker, hardware, and location data
   * Query params: trackerId (required), petID (optional)
   * @example GET /tracker/info?trackerId=abc123&petID=pet456
   */
  @Get('info')
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

  /**
   * Get tracker history between two timestamps
   * Path param: trackerID
   * Query params: from (unix timestamp), to (unix timestamp)
   */
  @Get(':trackerID/history')
  async getTrackerHistory(
    @Param('trackerID') trackerID: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<ApiResponse<TractivePositionHistory[]>> {
    try {
      const dto: TrackerHistoryDto = {
        trackerID,
        from: isNaN(Number(from)) ? from : Number(from),
        to: isNaN(Number(to)) ? to : Number(to),
      };
      const data = await this.trackerService.getTrackerHistory(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting tracker history: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Get a specific tracker
   */
  @Get(':trackerID')
  async getTracker(@Param('trackerID') trackerID: string): Promise<ApiResponse<TractiveTracker>> {
    try {
      const data = await this.trackerService.getTracker(trackerID);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting tracker: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }
}
