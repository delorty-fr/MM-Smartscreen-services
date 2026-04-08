import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { LocationModule } from './modules/location/location.module';
import { ConfigModule } from '@nestjs/config';
import { HardwareModule } from './modules/hardware/hardware.module';
import { AccountModule } from './modules/account/account.module';
import { PetModule } from './modules/pet/pet.module';
import { CommandModule } from './modules/command/command.module';
import { TrackerModule } from './modules/tracker/tracker.module';
import { RootController } from './root.controller';

@Module({
  imports: [
    LocationModule,
    AuthModule,
    HardwareModule,
    AccountModule,
    PetModule,
    CommandModule,
    TrackerModule,
    ConfigModule.forRoot(),
  ],
  controllers: [RootController],
})
export class AppModule {}
