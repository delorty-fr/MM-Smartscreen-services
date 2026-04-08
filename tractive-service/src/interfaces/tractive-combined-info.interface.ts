import { TractivePet } from './tractive-pet.interface';
import { TractiveTracker } from './tractive-tracker.interface';
import { TractiveHardware } from './tractive-hardware.interface';
import { TractiveLocation } from './tractive-location.interface';
import { PetHealthOverview } from './tractive-pet-health.interface';

/**
 * Combined interface containing all information for a tracker and its associated pet
 */
export interface TractiveCombinedInfo {
  pet?: TractivePet;
  petHealthData?: PetHealthOverview;
  tracker: TractiveTracker;
  hardware: TractiveHardware;
  location: TractiveLocation;
}
