import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NotAuthenticatedException } from '../../exceptions/NotAuthenticated.exception';
import { AuthenticationStore } from '../store/authentication.store';
import { CommandResponse } from '../../interfaces/tractive-tracker.interface';
import { TractiveApi } from '../../constants';
import { TrackerCommandDto } from '../../dto/command.dto';

/**
 * Service for sending commands to trackers.
 */
@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);

  constructor(private readonly authenticationStore: AuthenticationStore) {}

  /**
   * Turn live tracking mode ON
   */
  public async liveOn(dto: TrackerCommandDto): Promise<CommandResponse> {
    this.logger.log(`Enable live tracking for tracker: ${dto.trackerID}`);
    return this.sendCommand(
      dto.trackerID,
      'command/live_tracking/on',
    );
  }

  /**
   * Turn live tracking mode OFF
   */
  public async liveOff(dto: TrackerCommandDto): Promise<CommandResponse> {
    this.logger.log(`Disable live tracking for tracker: ${dto.trackerID}`);
    return this.sendCommand(
      dto.trackerID,
      'command/live_tracking/off',
    );
  }

  /**
   * Turn LED light ON
   */
  public async ledOn(dto: TrackerCommandDto): Promise<CommandResponse> {
    this.logger.log(`Turn LED on for tracker: ${dto.trackerID}`);
    return this.sendCommand(
      dto.trackerID,
      'command/led_control/on',
    );
  }

  /**
   * Turn LED light OFF
   */
  public async ledOff(dto: TrackerCommandDto): Promise<CommandResponse> {
    this.logger.log(`Turn LED off for tracker: ${dto.trackerID}`);
    return this.sendCommand(
      dto.trackerID,
      'command/led_control/off',
    );
  }

  /**
   * Turn buzzer sound ON
   */
  public async buzzerOn(dto: TrackerCommandDto): Promise<CommandResponse> {
    this.logger.log(`Turn buzzer on for tracker: ${dto.trackerID}`);
    return this.sendCommand(
      dto.trackerID,
      'command/buzzer_control/on',
    );
  }

  /**
   * Turn buzzer sound OFF
   */
  public async buzzerOff(dto: TrackerCommandDto): Promise<CommandResponse> {
    this.logger.log(`Turn buzzer off for tracker: ${dto.trackerID}`);
    return this.sendCommand(
      dto.trackerID,
      'command/buzzer_control/off',
    );
  }

  /**
   * Send a command to the tracker
   */
  private async sendCommand(
    trackerID: string,
    command: string,
  ): Promise<CommandResponse> {
    const bearer = this.authenticationStore.accessToken;
    if (!bearer) {
      throw new NotAuthenticatedException();
    }

    try {
      const url = `${TractiveApi.BASE_URL}/tracker/${trackerID}/${command}`;
      const response = await axios.post(url, {}, {
        headers: {
          'X-Tractive-Client': TractiveApi.CLIENT_ID,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      });
      console.log('[TRACTIVE API RESPONSE] POST', url, response.data);
      return response.data;
    } catch (e: any) {
      this.logger.error(`Error while sending command ${command}: ${e?.message}`);
      throw e;
    }
  }
}
