import { Controller, Get, HttpStatus, Logger, Param } from '@nestjs/common';
import { PetService } from './pet.service';
import { TractivePet } from '../../interfaces/tractive-pet.interface';
import { PetHealthOverview } from '../../interfaces/tractive-pet-health.interface';
import { ApiResponse } from '../../interfaces/api-response';
import { GetPetDto } from '../../dto/pet.dto';
import { AxiosError } from 'axios';

/**
 * Controller for pet-related operations.
 */
@Controller({
  path: 'pet',
})
export class PetController {
  private readonly logger = new Logger(PetController.name);

  constructor(private readonly petService: PetService) {}

  /**
   * Get all pets
   */
  @Get()
  async getPets(): Promise<ApiResponse<TractivePet[]>> {
    try {
      const data = await this.petService.getPets();
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting pets: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Get a specific pet
   */
  @Get(':petID')
  async getPet(@Param() dto: GetPetDto): Promise<ApiResponse<TractivePet>> {
    try {
      const data = await this.petService.getPet(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting pet: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Get pet health overview
   */
  @Get(':petID/health')
  async getPetHealth(@Param() dto: GetPetDto): Promise<ApiResponse<PetHealthOverview>> {
    try {
      const data = await this.petService.getPetHealth(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while getting pet health: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }
}
