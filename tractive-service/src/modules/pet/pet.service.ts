import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';
import { AuthenticationStore } from '../store/authentication.store';
import { TractivePet } from '../../interfaces/tractive-pet.interface';
import { PetHealthOverview } from '../../interfaces/tractive-pet-health.interface';
import { TractiveApi } from '../../constants';
import { GetPetDto } from '../../dto/pet.dto';

// https://github.com/zhulik/aiotractive/blob/main/aiotractive/api.py#L28
// https://github.com/FAXES/tractive
// https://github.com/drrobotk/PyTractive/blob/main/PyTractive/bluetooth_linux.py

/**
 * Service for getting pet information from Tractive.
 */
@Injectable()
export class PetService {
  private readonly logger = new Logger(PetService.name);

  constructor(private readonly authenticationStore: AuthenticationStore) {}

  /**
   * Get a specific pet by ID
   */
  public async getPet(dto: GetPetDto): Promise<TractivePet> {
    this.logger.log(`Get pet: ${dto.petID}`);

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/trackable_object/${dto.petID}`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });

      console.log('[TRACTIVE API RESPONSE] GET', url, response.data);

      // Enhance with profile and cover picture links
      if (
        response.data.details &&
        response.data.details.profile_picture_id
      ) {
        response.data.details.profile_picture_link = `${TractiveApi.BASE_URL}/media/resource/${response.data.details.profile_picture_id}.jpg`;
      }
      if (response.data.details && response.data.details.cover_picture_id) {
        response.data.details.cover_picture_link = `${TractiveApi.BASE_URL}/media/resource/${response.data.details.cover_picture_id}.jpg`;
      }

      return response.data;
    } catch (e: any) {
      this.logger.error(`Error while getting pet: ${e?.message}`);
      throw e;
    }
  }

  /**
   * Get all pets on the account
   */
  public async getPets(): Promise<TractivePet[]> {
    this.logger.log(`Get all pets`);

    const bearer = this.authenticationStore.accessToken;
    const userId = this.authenticationStore.lastAuthenticationCache.user_id;
    if (!bearer || !userId) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/user/${userId}/trackable_objects`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      console.log('[TRACTIVE API RESPONSE] GET', url, response.data);
      return response.data;
    } catch (e: any) {
      this.logger.error(`Error while getting pets: ${e?.message}`);
      throw e;
    }
  }

  /**
   * Get pet health overview
   */
  public async getPetHealth(dto: GetPetDto): Promise<PetHealthOverview> {
    this.logger.log(`Get pet health overview: ${dto.petID}`);

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.APS_BASE_URL}/pet/${dto.petID}/health/overview`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      console.log('[TRACTIVE API RESPONSE] GET', url, response.data);
      return response.data;
    } catch (e: any) {
      this.logger.error(`Error while getting pet health: ${e?.message}`);
      throw e;
    }
  }
}
