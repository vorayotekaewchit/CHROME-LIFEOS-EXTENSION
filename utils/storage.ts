/**
 * Storage utilities with chrome.storage.local support and localStorage fallback
 */

// Declare chrome for TypeScript
declare const chrome: any;

/**
 * Type guard to validate if a value is a valid Mission object.
 */
export function isMission(value: unknown): value is Mission {
  if (typeof value !== "object" || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.id === "string" &&
    typeof obj.text === "string" &&
    typeof obj.completed === "boolean"
  );
}

/**
 * Type guard to validate if a value is a valid HistoryEntry object.
 */
export function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.date === "string" &&
    Array.isArray(obj.missions) &&
    obj.missions.every(isMission) &&
    typeof obj.totalCompleted === "number"
  );
}

/**
 * Type guard to validate if a value is a valid Momentum object.
 */
export function isMomentum(value: unknown): value is Momentum {
  if (typeof value !== "object" || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.currentWeek === "number" &&
    typeof obj.total === "number" &&
    typeof obj.startDate === "string"
  );
}

/**
 * Type guard to validate if a value is a valid LifeOSState object.
 */
export function isLifeOSState(value: unknown): value is LifeOSState {
  if (typeof value !== "object" || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    Array.isArray(obj.history) &&
    obj.history.every(isHistoryEntry) &&
    isMomentum(obj.momentum) &&
    typeof obj.lastResetDate === "string"
  );
}

export type MissionTag = "Focus" | "Health" | "Money" | "Admin" | "Relationships";

export interface Mission {
  id: string;
  title: string;
  tag: MissionTag;
  duration: number; // in minutes
  why?: string;
  completed: boolean;
  completedAt?: Date;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD format
  missions: Mission[];
  totalCompleted: number;
}

export interface Momentum {
  currentWeek: number; // Current week's total (0-100)
  total: number; // Total momentum accumulated
  startDate: string; // Date when momentum tracking started
}

export interface LifeOSState {
  history: HistoryEntry[];
  momentum: Momentum;
  lastResetDate: string; // Last date when missions were reset
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

/**
 * Get date string in YYYY-MM-DD format from a Date object
 */
export function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Safely parse JSON from storage with type validation and chrome.storage.local support
 */
export async function safeGetFromStorage<T>(
  key: string,
  validator: (value: unknown) => value is T,
  fallback: T
): Promise<T> {
  try {
    // Try chrome.storage.local first
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(key, (result: any) => {
          if (result[key]) {
            resolve(processResult(result[key], validator, fallback));
          } else {
            // Fallback to localStorage
            const item = localStorage.getItem(key);
            if (item === null) {
              resolve(fallback);
            } else {
              try {
                const parsed = JSON.parse(item);
                resolve(processResult(parsed, validator, fallback));
              } catch (e) {
                resolve(fallback);
              }
            }
          }
        });
      });
    }

    // Standard web fallback
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    const parsed = JSON.parse(item);
    return processResult(parsed, validator, fallback);
  } catch (error) {
    console.warn(`Failed to parse storage item "${key}":`, error);
    return fallback;
  }
}

function processResult<T>(parsed: any, validator: (value: unknown) => value is T, fallback: T): T {
  // Handle Date strings - convert completedAt strings back to Date objects
  if (validator(parsed) && Array.isArray((parsed as any).history)) {
    (parsed as any).history = (parsed as any).history.map((entry: HistoryEntry) => {
      if (entry.missions) {
        entry.missions = entry.missions.map((mission: Mission) => {
          if (mission.completedAt && typeof mission.completedAt === "string") {
            return {
              ...mission,
              completedAt: new Date(mission.completedAt),
            };
          }
          return mission;
        });
      }
      return entry;
    });
  }
  return validator(parsed) ? parsed : fallback;
}

/**
 * Safely write JSON to storage with chrome.storage.local support
 */
export async function safeSetToStorage<T>(key: string, value: T): Promise<boolean> {
  try {
    // Save to chrome.storage.local
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    }
    
    // Always fallback/sync to localStorage
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to write to storage item "${key}":`, error);
    return false;
  }
}

/**
 * Get default LifeOSState
 */
export function getDefaultLifeOSState(): LifeOSState {
  const today = getTodayDateString();
  return {
    history: [],
    momentum: {
      currentWeek: 0,
      total: 0,
      startDate: today
    },
    lastResetDate: today
  };
}

/**
 * Get the Monday of the current week as a date string (YYYY-MM-DD)
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return getDateString(monday);
}

/**
 * Get the day index (0-6) for Monday-Sunday
 * 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
 */
export function getDayIndex(date: Date = new Date()): number {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return day === 0 ? 6 : day - 1; // Convert to Monday=0, Sunday=6
}
