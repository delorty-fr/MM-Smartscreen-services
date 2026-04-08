import { Module } from '@nestjs/common';
import { TrackerController } from './tracker.controller';
import { TrackerService } from './tracker.service';
import { StoreModule } from '../store/store.module';
import { PetModule } from '../pet/pet.module';
import { HardwareModule } from '../hardware/hardware.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [StoreModule, PetModule, HardwareModule, LocationModule],
  controllers: [TrackerController],
  providers: [TrackerService],
  exports: [TrackerService],
})
export class TrackerModule {}
