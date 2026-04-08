import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';
import { AuthenticationStore } from '../store/authentication.store';
import {
  TractiveTracker,
} from '../../interfaces/tractive-tracker.interface';
import { TractivePositionHistory } from '../../interfaces/tractive-position-history.interface';
import { TractiveApi } from '../../constants';
import { TrackerHistoryDto } from '../../dto/tracker-history.dto';
import { TractiveCombinedInfo } from '../../interfaces/tractive-combined-info.interface';
import { PetService } from '../pet/pet.service';
import { HardwareService } from '../hardware/hardware.service';
import { LocationService } from '../location/location.service';
import { TrackerDto } from '../../dto/tracker.dto';
import { GetPetDto } from '../../dto/pet.dto';

/**
 * Service for tracker information and history from Tractive.
 */
@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(
    private readonly authenticationStore: AuthenticationStore,
    private readonly petService: PetService,
    private readonly hardwareService: HardwareService,
    private readonly locationService: LocationService,
  ) {}

  /**
   * Get all trackers on the account
   */
  public async getAllTrackers(): Promise<TractiveTracker[]> {
    this.logger.log(`Get all trackers`);

    const bearer = this.authenticationStore.accessToken;
    const userId = this.authenticationStore.lastAuthenticationCache.user_id;
    if (!bearer || !userId) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/user/${userId}/trackers`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      return response.data;
    } catch (e: any) {
      this.logger.error(`Error while getting all trackers: ${e?.message}`);
      throw e;
    }
  }

  /**
   * Get a specific tracker by ID
   */
  public async getTracker(trackerID: string): Promise<TractiveTracker> {
    this.logger.log(`Get tracker: ${trackerID}`);

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/tracker/${trackerID}`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      return response.data;
    } catch (e: any) {
      this.logger.error(`Error while getting tracker: ${e?.message}`);
      throw e;
    }
  }

  /**
   * Get location history for a tracker between two timestamps
   */
  public async getTrackerHistory(
    dto: TrackerHistoryDto,
  ): Promise<TractivePositionHistory[]> {
    this.logger.log(
      `Get tracker history for ${dto.trackerID} from ${dto.from} to ${dto.to}`,
    );

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      // Convert dates if they're objects (Date instances)
      const from = dto.from as any;
      const to = dto.to as any;
      
      let calcFrom = typeof from === 'object' && from?.getTime
        ? (from.getTime() / 1000).toFixed(0)
        : String(from);
      let calcTo = typeof to === 'object' && to?.getTime
        ? (to.getTime() / 1000).toFixed(0)
        : String(to);

      const url = `${TractiveApi.BASE_URL}/tracker/${encodeURIComponent(
        dto.trackerID,
      )}/positions?time_from=${encodeURIComponent(
        calcFrom,
      )}&time_to=${encodeURIComponent(
        calcTo,
      )}&format=json_segments`;

      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });

      // The API returns data in segments, extract the first segment
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }

      return response.data;
    } catch (e: any) {
      this.logger.error(`Error while getting tracker history: ${e?.message}`);
      throw e;
    }
  }

  /**
   * Get combined information for a tracker including pet, hardware, and location data
   * @param trackerId - The ID of the tracker
   * @param petID - Optional pet ID. If not provided, will use tracker's trackable_object_id
   */
  public async getCombinedInfo(trackerId: string, petID?: string): Promise<TractiveCombinedInfo> {
    this.logger.log(`Get combined info for tracker: ${trackerId}${petID ? `, pet: ${petID}` : ''}`);

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      // Fetch tracker info first
      const tracker = await this.getTracker(trackerId);

      // Fetch hardware and location info in parallel
      const trackerDto: TrackerDto = { trackerId: trackerId };
      const [hardware, location] = await Promise.all([
        this.hardwareService.getTrackerHardware(trackerDto),
        this.locationService.getTrackerLocation(trackerDto),
      ]);

      // Determine which pet ID to use for fetching pet and health data
      const resolvedPetId = petID || tracker.trackable_object_id;

      // Fetch pet and pet health info in parallel if petID is available
      let pet = undefined;
      let petHealthData = undefined;
      if (resolvedPetId) {
        try {
          const petDto: GetPetDto = { petID: resolvedPetId };
          [pet, petHealthData] = await Promise.all([
            this.petService.getPet(petDto),
            this.petService.getPetHealth(petDto),
          ]);
        } catch (e: any) {
          this.logger.warn(`Could not fetch pet info for ${resolvedPetId}: ${e?.message}`);
          // Continue without pet info
        }
      }

      return {
        pet,
        petHealthData,
        tracker,
        hardware,
        location,
      };
    } catch (e: any) {
      // Log detailed error information
      if (e.response) {
        this.logger.error(
          `Error while getting combined info - Status: ${e.response.status}, Data: ${JSON.stringify(e.response.data)}`
        );
      } else {
        this.logger.error(`Error while getting combined info for tracker: ${e?.message}`);
      }
      throw e;
    }
  }
}

