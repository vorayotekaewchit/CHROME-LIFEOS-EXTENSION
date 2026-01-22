// Life OS - Background Service Worker
// Handles daily mission resets and badge updates

/**
 * Initialize storage on extension install
 */
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const result = await chrome.storage.local.get(['lifeOS']);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!result.lifeOS) {
      // Initialize with default state
      const defaultState = {
        history: [],
        momentum: {
          currentWeek: 0,
          total: 0,
          startDate: today
        },
        lastResetDate: today
      };
      await chrome.storage.local.set({ lifeOS: defaultState });
      console.log('Life OS initialized with fresh data');
      await updateBadge(0);
    } else {
      // Check if we need to reset today's missions
      await checkAndResetDailyMissions(result.lifeOS, today);
    }
  } catch (error) {
    console.error('Error during installation:', error);
  }
});

/**
 * Refresh data on browser startup
 * Ensures daily reset happens even if browser was closed at midnight
 */
chrome.runtime.onStartup.addListener(async () => {
  try {
    const result = await chrome.storage.local.get(['lifeOS']);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (result.lifeOS) {
      await checkAndResetDailyMissions(result.lifeOS, today);
    }
  } catch (error) {
    console.error('Error during startup:', error);
  }
});

/**
 * Check if date changed and reset today's missions if needed
 * This preserves all historical data and only resets the current day's active missions
 */
async function checkAndResetDailyMissions(state, today) {
  if (state.lastResetDate !== today) {
    // New day detected - reset only today's missions
    // Keep all history intact
    const updatedState = {
      ...state,
      lastResetDate: today
    };
    
    await chrome.storage.local.set({ lifeOS: updatedState });
    console.log('Life OS daily reset - new day detected');
    
    // Update badge based on today's completed missions
    const todayEntry = state.history.find(entry => entry.date === today);
    const completedCount = todayEntry ? todayEntry.totalCompleted : 0;
    await updateBadge(completedCount);
  } else {
    // Same day - update badge with current count
    const todayEntry = state.history.find(entry => entry.date === today);
    const completedCount = todayEntry ? todayEntry.totalCompleted : 0;
    await updateBadge(completedCount);
  }
}

/**
 * Listen for messages from popup (mission updates)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'missionUpdated') {
    updateBadge(message.count);
    sendResponse({ success: true });
  } else if (message.type === 'checkDateReset') {
    checkDateReset().then(() => sendResponse({ success: true }));
    return true; // Keep message channel open for async response
  }
  return true;
});

/**
 * Listen for storage changes
 * Updates badge whenever missions change
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.lifeOS) {
    const newValue = changes.lifeOS.newValue;
    if (newValue && newValue.history) {
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = newValue.history.find(entry => entry.date === today);
      const completedCount = todayEntry ? todayEntry.totalCompleted : 0;
      updateBadge(completedCount);
    }
  }
});

/**
 * Update extension badge with mission count
 * @param {number} count - Number of missions completed today
 */
async function updateBadge(count) {
  try {
    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#FF6B1A' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

/**
 * Periodic check for date changes
 * Runs every time service worker wakes up
 * Ensures midnight reset works even if browser stays open
 */
async function checkDateReset() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await chrome.storage.local.get(['lifeOS']);
    
    if (result.lifeOS) {
      await checkAndResetDailyMissions(result.lifeOS, today);
    }
  } catch (error) {
    console.error('Error checking date reset:', error);
  }
}

// Check date reset when service worker activates
checkDateReset();

// Set up alarm for midnight reset (backup)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    checkDateReset();
  }
});

// Create alarm for daily reset at midnight
chrome.alarms.create('dailyReset', {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60 // Repeat every 24 hours
});

/**
 * Get timestamp for next midnight
 */
function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}
