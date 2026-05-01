import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';
import { AuthenticationStore } from '../store/authentication.store';
import {
  TractiveAccount,
  TractiveSubscription,
} from '../../interfaces/tractive-account.interface';
import { TractiveApi } from '../../constants';
import { GetAccountSubscriptionDto } from '../../dto/account.dto';

/**
 * Service for getting account information from Tractive.
 */
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(private readonly authenticationStore: AuthenticationStore) {}

  /**
   * Get the account information
   */
  public async getAccountInfo(): Promise<TractiveAccount> {
    this.logger.log(`Get account info`);

    const bearer = this.authenticationStore.accessToken;
    const userId = this.authenticationStore.lastAuthenticationCache.user_id;
    if (!bearer || !userId) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/user/${userId}`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      console.log('[TRACTIVE API RESPONSE] GET', url, response.data);
      return response.data;
    } catch (e) {
      this.logger.error(`Error while getting account info: ${e.message}`);
      throw e;
    }
  }

  /**
   * Get all account subscriptions
   */
  public async getAccountSubscriptions(): Promise<TractiveSubscription[]> {
    this.logger.log(`Get account subscriptions`);

    const bearer = this.authenticationStore.accessToken;
    const userId = this.authenticationStore.lastAuthenticationCache.user_id;
    if (!bearer || !userId) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/user/${userId}/subscriptions`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      console.log('[TRACTIVE API RESPONSE] GET', url, response.data);
      return response.data;
    } catch (e) {
      this.logger.error(`Error while getting account subscriptions: ${e.message}`);
      throw e;
    }
  }

  /**
   * Get a specific subscription
   */
  public async getAccountSubscription(
    dto: GetAccountSubscriptionDto,
  ): Promise<TractiveSubscription> {
    this.logger.log(`Get account subscription: ${dto.subscriptionID}`);

    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/subscription/${dto.subscriptionID}`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      console.log('[TRACTIVE API RESPONSE] GET', url, response.data);
      return response.data;
    } catch (e) {
      this.logger.error(`Error while getting subscription: ${e.message}`);
      throw e;
    }
  }

  /**
   * Get list of accounts you share trackers with
   */
  public async getAccountShares(): Promise<any[]> {
    this.logger.log(`Get account shares`);

    const bearer = this.authenticationStore.accessToken;
    const userId = this.authenticationStore.lastAuthenticationCache.user_id;
    if (!bearer || !userId) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/user/${userId}/shares`;
      const response = await axios.get(url, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      console.log('[TRACTIVE API RESPONSE] GET', url, response.data);
      return response.data;
    } catch (e) {
      this.logger.error(`Error while getting account shares: ${e.message}`);
      throw e;
    }
  }
}
