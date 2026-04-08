export interface ActivitySetting {
  _id: string;
  _version: string;
  daily_goal: number;
  daily_distance_goal: number;
  daily_active_minutes_goal: number;
  activity_category_thresholds_override?: any;
  daily_active_minutes_goal_is_default: boolean;
  _type: string;
}

export interface PetDetail {
  _id: string;
  _version: string;
  name: string;
  pet_type: string;
  breed_ids: string[];
  gender: string;
  birthday: number;
  height: number;
  length?: number;
  weight: number;
  chip_id?: string;
  neutered: boolean;
  personality: any[];
  lost_or_dead?: any;
  lim?: any;
  ribcage?: any;
  weight_is_default?: boolean;
  height_is_default?: boolean;
  birthday_is_default?: boolean;
  breed_is_default?: boolean;
  instagram_username?: string;
  profile_picture_id?: string;
  cover_picture_id?: string;
  gallery_picture_ids: string[];
  activity_settings: ActivitySetting;
  _type: string;
  read_only: boolean;
}

export interface TractivePet {
  _id: string;
  _version: string;
  _type: string;
  leaderboard_opt_out: boolean;
  device_id?: string;
  details: PetDetail;
  read_only: boolean;
  created_at: number;
  home_location?: number[];
  id?: string;
  name?: string;
  type?: string;
  tracker_id?: string;
  [key: string]: any;
}
