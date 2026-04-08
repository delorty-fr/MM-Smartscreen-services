export interface TractiveTracker {
  _id: string;
  _type: string;
  _version: string;
  hw_id?: string;
  model_number?: string;
  hw_edition?: string;
  bluetooth_mac?: string;
  geofence_sensitivity?: string;
  read_only?: boolean;
  self_test_available?: boolean;
  capabilities?: string[];
  supported_geofence_types?: string[];
  fw_version?: string;
  battery_save_mode?: boolean;
  state?: string;
  state_reason?: string;
  charging_state?: string;
  battery_state?: string;
  power_saving_zone_id?: string;
  prioritized_zone_id?: string;
  prioritized_zone_type?: string;
  prioritized_zone_last_seen_at?: number;
  prioritized_zone_entered_at?: number;
  id?: string;
  name?: string;
  model?: string;
  trackable_object_id?: string;
  imei?: string;
  device_id?: string;
  [key: string]: any;
}

export interface CommandResponse {
  command: string;
  status: string;
  result?: any;
  [key: string]: any;
}
