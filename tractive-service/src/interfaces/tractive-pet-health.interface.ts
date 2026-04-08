export interface HealthMetric {
  value?: number;
  status?: string;
  timestamp?: number;
  unit?: string;
  [key: string]: any;
}

export interface PetHealthOverview {
  _id?: string;
  _version?: string;
  _type?: string;
  pet_id?: string;
  date?: number;
  timestamp?: number;
  vitality_score?: number;
  wellness_score?: number;
  activity_level?: string;
  rest_quality?: string;
  body_condition_score?: number;
  weight?: number;
  energy_level?: string;
  mobility?: string;
  digestion?: string;
  skin_coat?: string;
  [key: string]: any;
}
