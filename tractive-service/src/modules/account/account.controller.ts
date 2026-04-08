import { Controller, Get, HttpStatus, Logger, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import {
  TractiveAccount,
  TractiveSubscription,
} from '../../interfaces/tractive-account.interface';
import { ApiResponse } from '../../interfaces/api-response';
import { GetAccountSubscriptionDto } from '../../dto/account.dto';
import { AxiosError } from 'axios';

/**
 * Controller for account-related operations.
 */
@Controller({
  path: 'account',
})
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private readonly accountService: AccountService) {}

  /**
   * Get account information
   */
  @Get('info')
  async getAccountInfo(): Promise<ApiResponse<TractiveAccount>> {
    try {
      const data = await this.accountService.getAccountInfo();
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting account info: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Get all subscriptions
   */
  @Get('subscriptions')
  async getAccountSubscriptions(): Promise<ApiResponse<TractiveSubscription[]>> {
    try {
      const data = await this.accountService.getAccountSubscriptions();
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting subscriptions: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Get a specific subscription
   */
  @Get('subscriptions/:subscriptionID')
  async getAccountSubscription(
    @Param() dto: GetAccountSubscriptionDto,
  ): Promise<ApiResponse<TractiveSubscription>> {
    try {
      const data = await this.accountService.getAccountSubscription(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting subscription: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Get account shares
   */
  @Get('shares')
  async getAccountShares(): Promise<ApiResponse<any[]>> {
    try {
      const data = await this.accountService.getAccountShares();
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting shares: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }
}
