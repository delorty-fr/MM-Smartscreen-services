export interface UserDetail {
  _id: string;
  _version: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  gender?: string;
  birthday?: string;
  _type: string;
}

export interface UserDemographic {
  _id: string;
  _version: string;
  locale: string;
  language: string;
  country: string;
  is_language_set_by_user: boolean;
  _type: string;
}

export interface NotificationMailSetting {
  _id: string;
  _version: string;
  user_registered: boolean;
  geofence_in: boolean;
  geofence_out: boolean;
  battery_full: boolean;
  battery_low: boolean;
  battery_critical: boolean;
  battery_empty: boolean;
  charging_reminder: boolean;
  tracker_startup_shutdown: boolean;
  sharing: boolean;
  wellness_and_activity: boolean;
  point_of_interest_warnings: boolean;
  _type: string;
}

export interface NotificationPushSetting {
  _id: string;
  _version: string;
  user_registered: boolean;
  geofence_in: boolean;
  geofence_out: boolean;
  battery_full: boolean;
  battery_low: boolean;
  battery_critical: boolean;
  battery_empty: boolean;
  charging_reminder: boolean;
  tracker_startup_shutdown: boolean;
  sharing: boolean;
  support: boolean;
  wellness_and_activity: boolean;
  point_of_interest_warnings: boolean;
  _type: string;
}

export interface NotificationWebPushSetting {
  _id: string;
  _version: string;
  geofence_in: boolean;
  geofence_out: boolean;
  battery_full: boolean;
  battery_low: boolean;
  battery_critical: boolean;
  battery_empty: boolean;
  charging_reminder: boolean;
  tracker_startup_shutdown: boolean;
  sharing: boolean;
  support: boolean;
  wellness_and_activity: boolean;
  point_of_interest_warnings: boolean;
  _type: string;
}

export interface UserSetting {
  _id: string;
  _version: string;
  email: string;
  metric_system: boolean;
  preferred_map_type_street: string;
  preferred_map_type_hybrid: string;
  get_live_position_feature_enabled: boolean;
  distance_unit: string;
  weight_unit: string;
  badge_celebrations_disabled?: boolean;
  mail_settings: NotificationMailSetting;
  push_settings: NotificationPushSetting;
  web_push_settings: NotificationWebPushSetting;
  push_sound_settings?: any;
  _type: string;
}

export interface InvoiceAddress {
  _id: string;
  _version: string;
  first_name: string;
  last_name: string;
  street_name?: string;
  street_number?: string;
  city?: string;
  zip_code?: string;
  country: string;
  state?: string;
  _type: string;
}

export interface TractiveAccount {
  _id: string;
  created_at: number;
  updated_at: number;
  _version: string;
  email: string;
  password_digest: string;
  short_name?: string;
  locked_at?: string;
  marked_for_potential_deletion_at?: string;
  deleted_at?: string;
  activated_at: number;
  permissions: any[];
  profile_picture_id?: string;
  zendesk_user?: any;
  last_zendesk_sync?: string;
  review_invited_at?: string;
  shopper_reference: string;
  referral_code: string;
  referral_bonus_type: string;
  guid: string;
  activity_screen_share_count?: number;
  is_banned_from_leaderboards?: boolean;
  crm_sync_disabled?: boolean;
  details: UserDetail;
  demographics: UserDemographic;
  settings: UserSetting;
  invoice_address: InvoiceAddress;
  shelter?: any;
  vip_info?: any;
  profile_pictures: any[];
  subscription_and_fraud_settings?: any;
  created_by: {
    _id: string;
    _type: string;
    _version: string;
  };
  _type: string;
  role: string[];
  referral_link: string;
  terms_accepted_at: number;
  privacy_policy_accepted_at: number;
  uses_federated_login: boolean;
  has_password: boolean;
}

export interface TractiveSubscription {
  _id: string;
  _type: string;
  _version: string;
  type?: string;
  status?: string;
  created_at?: number;
  expires_at?: number;
  [key: string]: any;
}
