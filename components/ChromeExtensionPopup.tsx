import { useState, useEffect } from "react";
import { InputScreen } from "./screens/InputScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { FocusScreen } from "./screens/FocusScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { BottomTabBar, type Tab } from "./BottomTabBar";
import { safeGetFromStorage, safeSetToStorage, isAppState, type Mission, type AppState } from "../utils/storage";

const INITIAL_STATE: AppState = {
  missions: [],
  xp: 0,
  streak: 0,
  last7Days: [0, 0, 0, 0, 0, 0, 0],
  currentView: "input",
  lastResetDate: new Date().toDateString()
};

export function ChromeExtensionPopup() {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<Tab>("plan");
  
  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      const savedState = await safeGetFromStorage<AppState>("lifeOS", isAppState, INITIAL_STATE);
      setState(savedState);
      setIsLoading(false);
    };
    loadState();
  }, []);
  
  // Save to storage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      safeSetToStorage("lifeOS", state);
    }
  }, [state, isLoading]);
  
  // Check if we need to reset for a new day
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastResetDate !== today) {
      setState(prev => {
        // Only reset if there were missions yesterday
        if (prev.missions.length === 0) return prev;
        
        // Update last 7 days with yesterday's count
        const completedCount = prev.missions.filter(m => m.completed).length;
        const newLast7Days = [...prev.last7Days.slice(1), completedCount];
        
        // If at least one mission was completed, maintain or increment streak
        const newStreak = completedCount >= 1 ? prev.streak + 1 : 0;
        
        return {
          ...prev,
          missions: [],
          last7Days: newLast7Days,
          streak: newStreak,
          lastResetDate: today,
          currentView: "input"
        };
      });
    }
  }, [state.lastResetDate]);
  
  /**
   * Handles the generation of a new plan from the input screen.
   * Updates state with the new missions and switches to the plan view.
   */
  const handleGeneratePlan = (missions: Mission[]) => {
    setState(prev => ({
      ...prev,
      missions,
      currentView: "plan"
    }));
    setActiveTab("plan");
  };
  
  /**
   * Initiates the focus session by switching to the focus view.
   * Called when user starts their day from the plan screen.
   */
  const handleStartDay = () => {
    setState(prev => ({ ...prev, currentView: "focus" }));
    setActiveTab("focus");
  };
  
  /**
   * Marks a mission as completed and awards XP.
   * Updates the mission's completed status and timestamp.
   */
  const handleCompleteMission = (missionId: string, feeling?: "good" | "neutral" | "bad") => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => 
        m.id === missionId 
          ? { ...m, completed: true, completedAt: new Date() }
          : m
      ),
      xp: prev.xp + 10 // Award 10 XP per completed mission
    }));
  };
  
  /**
   * Handles skipping a mission with a small XP reward for conscious decision-making.
   * Awards 2 XP for making a deliberate choice to skip rather than complete.
   */
  const handleSkipMission = (missionId: string) => {
    // Award 2 XP for conscious choice to skip
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => 
        m.id === missionId 
          ? { ...m, completed: false }
          : m
      ),
      xp: prev.xp + 2
    }));
  };
  
  /**
   * Completes the current day and transitions to the dashboard.
   * Updates streak if at least one mission was completed.
   */
  const handleFinishDay = () => {
    // Update streak if at least one mission was completed
    const completedCount = state.missions.filter(m => m.completed).length;
    
    setState(prev => ({
      ...prev,
      currentView: "dashboard",
      streak: completedCount >= 1 ? prev.streak + 1 : prev.streak
    }));
    setActiveTab("dashboard");
  };
  
  /**
   * Resets the current day, clearing all missions and returning to input view.
   * Useful for starting fresh or correcting mistakes.
   */
  const handleResetDay = () => {
    setState(prev => ({
      ...prev,
      missions: [],
      currentView: "input"
    }));
    setActiveTab("plan");
  };
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    
    // Map tab to view
    if (tab === "plan") {
      if (state.missions.length === 0) {
        setState(prev => ({ ...prev, currentView: "input" }));
      } else {
        setState(prev => ({ ...prev, currentView: "plan" }));
      }
    } else if (tab === "focus") {
      setState(prev => ({ ...prev, currentView: "focus" }));
    } else if (tab === "dashboard") {
      setState(prev => ({ ...prev, currentView: "dashboard" }));
    }
  };
  
  // Get previous missions (for "import from yesterday" feature)
  const previousMissions = state.missions.filter(m => !m.completed);
  
  if (isLoading) {
    return (
      <div className="extension-container items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="extension-container">
      {/* Scrollable content area */}
      <div className="extension-scrollable">
        {state.currentView === "input" && (
          <InputScreen 
            onGeneratePlan={handleGeneratePlan}
            previousMissions={previousMissions}
          />
        )}
        
        {state.currentView === "plan" && (
          <PlanScreen
            missions={state.missions}
            streak={state.streak}
            onStartDay={handleStartDay}
          />
        )}
        
        {state.currentView === "focus" && (
          <FocusScreen
            missions={state.missions}
            streak={state.streak}
            xp={state.xp}
            onCompleteMission={handleCompleteMission}
            onSkipMission={handleSkipMission}
            onFinishDay={handleFinishDay}
          />
        )}
        
        {state.currentView === "dashboard" && (
          <DashboardScreen
            missions={state.missions}
            xp={state.xp}
            streak={state.streak}
            last7Days={state.last7Days}
            onResetDay={handleResetDay}
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
