export interface TractivePositionHistory {
  time: number;
  latlong: number[];
  alt: number;
  speed?: number;
  course?: number;
  pos_uncertainty: number;
  sensor_used: string;
  id?: string;
  time_rcvd?: number;
  altitude?: number;
  report_id?: string;
  nearby_user_id?: any;
  power_saving_zone_id?: any;
  _id?: string;
  _type?: string;
  _version?: string;
  [key: string]: any;
}
