import { useState, useEffect } from "react";
import { InputScreen } from "./screens/InputScreen";
import { PlanningScreen } from "./screens/PlanningScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { FocusScreen } from "./screens/FocusScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { BottomTabBar, type Tab } from "./BottomTabBar";
import { 
  safeGetFromStorage, 
  safeSetToStorage, 
  isLifeOSState,
  getDefaultLifeOSState,
  type Mission,
  type LifeOSState,
  type HistoryEntry,
  getTodayDateString,
  getYesterdayDateString
} from "../utils/storage";
import { useLifeOStore, hydrateLifeOState } from "../hooks/useLifeOState";

export function ChromeExtensionPopup() {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<LifeOSState>(getDefaultLifeOSState());
  const [todayMissions, setTodayMissions] = useState<Mission[]>([]);
  const { currentPage: activeTab, setPage, darkMode } = useLifeOStore();
  
  // Apply dark mode class to root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      // Hydrate UI state first
      await hydrateLifeOState();
      
      // Load LifeOS state
      const savedState = await safeGetFromStorage<LifeOSState>(
        "lifeOS", 
        isLifeOSState, 
        getDefaultLifeOSState()
      );
      
      const today = getTodayDateString();
      
      // Check if we need to reset today's missions (new day)
      if (savedState.lastResetDate !== today) {
        // New day - reset today's missions but keep all history
        const updatedState = {
          ...savedState,
          lastResetDate: today
        };
        setState(updatedState);
        setTodayMissions([]);
        await safeSetToStorage("lifeOS", updatedState);
      } else {
        // Same day - load today's missions from history
        setState(savedState);
        const todayEntry = savedState.history.find(entry => entry.date === today);
        setTodayMissions(todayEntry ? [...todayEntry.missions] : []);
      }
      
      setIsLoading(false);
    };
    loadState();
  }, []);
  
  // Save to storage whenever state or todayMissions change
  useEffect(() => {
    if (!isLoading) {
      const today = getTodayDateString();
      
      // Update or create today's history entry
      const updatedHistory = [...state.history];
      const todayIndex = updatedHistory.findIndex(entry => entry.date === today);
      
      const todayEntry: HistoryEntry = {
        date: today,
        missions: todayMissions,
        totalCompleted: todayMissions.filter(m => m.completed).length
      };
      
      if (todayIndex >= 0) {
        updatedHistory[todayIndex] = todayEntry;
      } else {
        updatedHistory.push(todayEntry);
      }
      
      const updatedState: LifeOSState = {
        ...state,
        history: updatedHistory
      };
      
      setState(updatedState);
      safeSetToStorage("lifeOS", updatedState);
    }
  }, [todayMissions, isLoading]);

  /**
   * Handles the generation of a new plan from the input screen.
   */
  const handleGeneratePlan = (missions: Mission[]) => {
    setTodayMissions(missions);
    setPage("plan");
  };
  
  /**
   * Initiates the focus session by switching to the focus view.
   */
  const handleStartDay = () => {
    setPage("focus");
  };
  
  /**
   * Marks a mission as completed and updates momentum.
   */
  const handleCompleteMission = (missionId: string, _feeling?: "good" | "neutral" | "bad") => {
    setTodayMissions(prev => {
      const updated = prev.map(m => 
        m.id === missionId 
          ? { ...m, completed: true, completedAt: new Date() }
          : m
      );
      
      // Update momentum when mission is completed
      const completedCount = updated.filter(m => m.completed).length;
      const previousCompleted = prev.filter(m => m.completed).length;
      
      // Only increment if this is a new completion
      if (completedCount > previousCompleted) {
        setState(prevState => {
          const newMomentum = {
            ...prevState.momentum,
            currentWeek: Math.min(100, prevState.momentum.currentWeek + 1),
            total: prevState.momentum.total + 1
          };
          
          return {
            ...prevState,
            momentum: newMomentum
          };
        });
      }
      
      return updated;
    });
  };
  
  /**
   * Handles skipping a mission.
   */
  const handleSkipMission = (missionId: string) => {
    setTodayMissions(prev => 
      prev.map(m => 
        m.id === missionId 
          ? { ...m, completed: false }
          : m
      )
    );
  };
  
  /**
   * Completes the current day and transitions to the dashboard.
   */
  const handleFinishDay = () => {
    setPage("dashboard");
  };
  
  /**
   * Adds a yesterday's incomplete mission to today's list.
   */
  const handleAddYesterdayMission = (mission: Mission) => {
    const newMission: Mission = {
      ...mission,
      id: `${mission.id}-${Date.now()}`, // New ID to avoid conflicts
      completed: false,
      completedAt: undefined
    };
    setTodayMissions(prev => [...prev, newMission]);
  };
  
  const handleTabChange = (tab: Tab) => {
    setPage(tab);
  };
  
  // Get yesterday's incomplete missions
  const yesterday = getYesterdayDateString();
  const yesterdayEntry = state.history.find(entry => entry.date === yesterday);
  const yesterdayIncomplete = yesterdayEntry 
    ? yesterdayEntry.missions.filter(m => !m.completed)
    : [];
  
  if (isLoading) {
    const bgClass = darkMode 
      ? "bg-gradient-to-br from-neutral-900 to-neutral-800"
      : "bg-gradient-to-br from-neutral-50 to-white";
    const textClass = darkMode ? "text-neutral-300" : "text-neutral-600";
    
    return (
      <div className={`extension-container items-center justify-center ${bgClass}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className={`absolute inset-0 border-4 rounded-full ${
              darkMode ? "border-orange-500/30" : "border-orange-200"
            }`}></div>
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className={`text-sm font-medium ${textClass}`}>Loading your day...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="extension-container">
      {/* Scrollable content area */}
      <div className="extension-scrollable">
        {activeTab === "plan" && todayMissions.length === 0 && (
          <PlanningScreen 
            onGeneratePlan={handleGeneratePlan}
          />
        )}
        
        {activeTab === "plan" && todayMissions.length > 0 && (
          <PlanScreen
            missions={todayMissions}
            onStartDay={handleStartDay}
          />
        )}
        
        {activeTab === "focus" && (
          <FocusScreen
            missions={todayMissions}
            onCompleteMission={handleCompleteMission}
            onSkipMission={handleSkipMission}
            onFinishDay={handleFinishDay}
          />
        )}
        
        {activeTab === "dashboard" && (
          <DashboardScreen
            todayMissions={todayMissions}
            yesterdayIncomplete={yesterdayIncomplete}
            momentum={state.momentum}
            history={state.history}
            onAddYesterdayMission={handleAddYesterdayMission}
          />
        )}
      </div>
      
      {/* Bottom navigation - fixed at bottom */}
      <BottomTabBar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
