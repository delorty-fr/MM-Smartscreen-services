import { Controller, Post, HttpStatus, Logger, Param } from '@nestjs/common';
import { CommandService } from './command.service';
import { CommandResponse } from '../../interfaces/tractive-tracker.interface';
import { ApiResponse } from '../../interfaces/api-response';
import { TrackerCommandDto } from '../../dto/command.dto';
import { AxiosError } from 'axios';

/**
 * Controller for tracker command operations.
 */
@Controller({
  path: 'command',
})
export class CommandController {
  private readonly logger = new Logger(CommandController.name);

  constructor(private readonly commandService: CommandService) {}

  /**
   * Enable live tracking for a tracker
   */
  @Post(':trackerID/live/on')
  async liveOn(@Param() dto: TrackerCommandDto): Promise<ApiResponse<CommandResponse>> {
    try {
      const data = await this.commandService.liveOn(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while enabling live tracking: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Disable live tracking for a tracker
   */
  @Post(':trackerID/live/off')
  async liveOff(@Param() dto: TrackerCommandDto): Promise<ApiResponse<CommandResponse>> {
    try {
      const data = await this.commandService.liveOff(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while disabling live tracking: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Turn LED on for a tracker
   */
  @Post(':trackerID/led/on')
  async ledOn(@Param() dto: TrackerCommandDto): Promise<ApiResponse<CommandResponse>> {
    try {
      const data = await this.commandService.ledOn(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while turning LED on: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Turn LED off for a tracker
   */
  @Post(':trackerID/led/off')
  async ledOff(@Param() dto: TrackerCommandDto): Promise<ApiResponse<CommandResponse>> {
    try {
      const data = await this.commandService.ledOff(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while turning LED off: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Turn buzzer on for a tracker
   */
  @Post(':trackerID/buzzer/on')
  async buzzerOn(@Param() dto: TrackerCommandDto): Promise<ApiResponse<CommandResponse>> {
    try {
      const data = await this.commandService.buzzerOn(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while turning buzzer on: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }

  /**
   * Turn buzzer off for a tracker
   */
  @Post(':trackerID/buzzer/off')
  async buzzerOff(@Param() dto: TrackerCommandDto): Promise<ApiResponse<CommandResponse>> {
    try {
      const data = await this.commandService.buzzerOff(dto);
      return {
        status: HttpStatus.OK,
        data,
      };
    } catch (e: any) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e instanceof AxiosError) {
        status = e.response?.status || status;
      }
      this.logger.error(`Error while turning buzzer off: ${e?.message}`);
      return {
        status,
        data: null,
        message: e?.message,
      };
    }
  }
}
