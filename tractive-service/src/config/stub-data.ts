/**
 * Stub data loader - Reads stub data from JSON file on every request
 * This allows dynamic updates without restarting the server
 */

import * as fs from 'fs';
import * as path from 'path';

let cachedData: any = null;

/**
 * Load stub data from JSON file
 * File is read on every call to allow hot reloading
 */
function loadStubDataFromFile(): any {
  try {
    // Read from project root - single source of truth
    const stubDataPath = path.join(process.cwd(), 'stub-data.json');

    if (!fs.existsSync(stubDataPath)) {
      throw new Error(
        `stub-data.json not found at ${stubDataPath}. Please ensure stub-data.json exists in the project root.`,
      );
    }

    const rawData = fs.readFileSync(stubDataPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading stub data from JSON:', error);
    return null;
  }
}

/**
 * Get current timestamp in seconds
 */
function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Build stub data with dynamic timestamps
 */
function buildStubData(jsonData: any): any {
  const currentTime = getCurrentTime();

  return {
    // Auth
    STUB_AUTH_DATA: jsonData.auth,

    // Account
    STUB_ACCOUNT_INFO: jsonData.account,
    STUB_SUBSCRIPTION: {
      ...jsonData.subscription,
      start_date: currentTime,
      end_date: currentTime + 31536000,
      renewal_date: currentTime + 31536000,
    },

    // Pet
    STUB_PET: jsonData.pet,

    // Tracker
    STUB_TRACKER: {
      ...jsonData.tracker,
      prioritized_zone_last_seen_at: currentTime - 25,
      prioritized_zone_entered_at: currentTime - 50,
    },

    // Hardware
    STUB_HARDWARE_INFO: {
      ...jsonData.hardware,
      time: currentTime - 40,
    },

    // Location
    STUB_LOCATION: {
      ...jsonData.location,
      time: currentTime - 50,
      time_rcvd: currentTime - 10,
    },

    // Pet Health
    STUB_PET_HEALTH: {
      ...jsonData.petHealth,
      activityDataSyncedAt: new Date().toISOString(),
    },

    // Tracker History
    STUB_TRACKER_HISTORY: jsonData.trackerHistory.map((entry: any, index: number) => ({
      ...entry,
      time: currentTime - 3600 - index * 3600,
      time_rcvd: currentTime - 3580 - index * 3600,
    })),

    // Command Response
    STUB_COMMAND_RESPONSE: {
      ...jsonData.command,
      timestamp: currentTime,
    },

    // Combined Info
    get STUB_COMBINED_INFO() {
      return {
        pet: this.STUB_PET,
        petHealthData: this.STUB_PET_HEALTH,
        tracker: this.STUB_TRACKER,
        hardware: this.STUB_HARDWARE_INFO,
        location: this.STUB_LOCATION,
      };
    },
  };
}

/**
 * Get stub data - reads from JSON file on every call
 * Returns all stub data with computed timestamps
 */
export function getStubData(): any {
  const jsonData = loadStubDataFromFile();
  if (!jsonData) {
    throw new Error('Failed to load stub data from stub-data.json');
  }
  return buildStubData(jsonData);
}
