import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetAccountSubscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subscriptionID: string;
}
