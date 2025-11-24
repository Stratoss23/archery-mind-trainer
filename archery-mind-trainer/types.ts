export enum AppState {
  SETUP = 'SETUP',
  ACTIVE = 'ACTIVE',
  SUMMARY = 'SUMMARY'
}

export enum DrillPhase {
  IDLE = 'IDLE',
  PREP = 'PREP',      // Time to nock and draw
  HOLD = 'HOLD',      // Time at full draw (aiming)
  COMMAND = 'COMMAND', // The decision moment
  RECOVERY = 'RECOVERY' // Time between arrows
}

export interface Settings {
  prepTime: number; // Seconds
  holdTime: number; // Seconds (Fixed aiming time)
  shootPercentage: number; // 0-100
  numberOfArrows: number;
}

export interface DrillResult {
  arrowNumber: number;
  command: 'SHOOT' | 'HOLD';
  timestamp: Date;
}