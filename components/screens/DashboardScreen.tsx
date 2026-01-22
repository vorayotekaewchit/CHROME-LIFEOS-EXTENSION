import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Flame } from "lucide-react";
import { Mission, HistoryEntry, Momentum } from "../../utils/storage";
import { Heatmap } from "../Heatmap";
import { MissionTagPill } from "../MissionTagChips";
import { DarkModeToggle } from "../DarkModeToggle";
import { useLifeOStore } from "../../hooks/useLifeOState";

interface DashboardScreenProps {
  todayMissions: Mission[];
  yesterdayIncomplete: Mission[];
  momentum: Momentum;
  history: HistoryEntry[];
  onAddYesterdayMission: (mission: Mission) => void;
}

export function DashboardScreen({ 
  todayMissions, 
  yesterdayIncomplete,
  momentum,
  history,
  onAddYesterdayMission
}: DashboardScreenProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showGradient, setShowGradient] = useState(false);
  const { darkMode } = useLifeOStore();
  
  useEffect(() => {
    const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null;
      if (element.classList.contains('extension-scrollable')) return element;
      return findScrollableParent(element.parentElement);
    };

    const container = findScrollableParent(document.activeElement as HTMLElement) || 
                      document.querySelector('.extension-scrollable') as HTMLElement;
    
    if (!container) return;

    const handleScroll = () => {
      setShowGradient(container.scrollTop > 10);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  const completedToday = todayMissions.filter(m => m.completed).length;
  const completionRate = todayMissions.length > 0 
    ? Math.round((completedToday / todayMissions.length) * 100) 
    : 0;

  const momentumPercent = Math.min(100, momentum.currentWeek);
  const momentumDisplay = `${momentum.currentWeek}/100`;

  const bgClass = darkMode 
    ? "bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"
    : "bg-gradient-to-br from-neutral-50 via-white to-neutral-50";
  const cardClass = darkMode
    ? "border-neutral-700 bg-neutral-800/80"
    : "border-neutral-200 bg-white/80";
  const textClass = darkMode ? "text-white" : "text-neutral-900";
  const textMutedClass = darkMode ? "text-neutral-400" : "text-neutral-600";
  const textLightClass = darkMode ? "text-neutral-500" : "text-neutral-500";

  return (
    <div className={`min-h-full ${bgClass} relative`}>
      {/* Scroll gradient overlay */}
      {showGradient && (
        <div 
          className={`absolute top-0 left-0 right-0 h-20 pointer-events-none z-40 ${
            darkMode
              ? "bg-gradient-to-b from-neutral-900 via-neutral-900/80 to-transparent"
              : "bg-gradient-to-b from-neutral-50 via-neutral-50/80 to-transparent"
          }`}
        />
      )}
      
      <div className="max-w-md mx-auto px-3 py-4 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`space-y-3 p-5 rounded-xl border ${cardClass} backdrop-blur-sm shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <h1 className={`text-xl font-bold ${textClass} tracking-tight`}>Life OS</h1>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                darkMode 
                  ? "text-orange-400 bg-orange-500/20 border-orange-500/30"
                  : "text-orange-600 bg-orange-50 border-orange-200"
              } border`}>
                {momentum.total} 🔥
              </div>
            </div>
          </div>

          {/* Daily Progress */}
          <div className={`rounded-lg p-4 border ${
            darkMode ? "bg-gradient-to-r from-neutral-800 to-neutral-700 border-neutral-700" : "bg-gradient-to-r from-neutral-50 to-white border-neutral-100"
          } space-y-3`}>
            <div className={`flex justify-between items-center text-xs font-medium ${textMutedClass}`}>
              <span>Daily Progress</span>
              <span className="text-orange-500">{completionRate}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden shadow-inner ${
              darkMode ? "bg-neutral-700" : "bg-neutral-200"
            }`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-sm"
              />
            </div>
            <div className={`text-xs ${textLightClass}`}>
              {completedToday} / {todayMissions.length} missions completed
            </div>
          </div>
        </motion.div>

        {/* Momentum Bar with Heatmap Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`space-y-3 p-4 rounded-xl border ${cardClass} backdrop-blur-sm shadow-sm`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-semibold ${textClass}`}>Momentum</h3>
            <button
              onClick={() => setShowHeatmap(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                darkMode 
                  ? "hover:bg-neutral-700 text-orange-400 hover:text-orange-300"
                  : "hover:bg-neutral-100 text-orange-500 hover:text-orange-600"
              }`}
              title="View mission history"
            >
              <Flame className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className={`flex items-center justify-between text-xs ${textMutedClass}`}>
              <span>Weekly Progress</span>
              <span className={`${textClass} font-medium`}>{momentumDisplay}</span>
            </div>
            <div className={`w-full h-3 rounded-full overflow-hidden shadow-inner ${
              darkMode ? "bg-neutral-700" : "bg-neutral-200"
            }`}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${momentumPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"
              />
            </div>
            <div className={`text-xs ${textLightClass}`}>
              Total momentum: {momentum.total} (never resets)
            </div>
          </div>
        </motion.div>

        {/* Yesterday's Incomplete Missions */}
        {yesterdayIncomplete.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`space-y-3 p-4 rounded-xl border ${cardClass} backdrop-blur-sm shadow-sm`}
          >
            <h3 className={`text-sm font-semibold ${textClass}`}>Yesterday's Incomplete</h3>
            <p className={`text-xs ${textMutedClass}`}>Complete today again?</p>
            <div className="space-y-2">
              {yesterdayIncomplete.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => onAddYesterdayMission(mission)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                    darkMode
                      ? "border-neutral-700 bg-neutral-700/50 hover:bg-neutral-700 hover:border-orange-500/50 text-neutral-300 hover:text-white"
                      : "border-neutral-200 bg-white hover:bg-neutral-50 hover:border-orange-300 text-neutral-700 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">+</span>
                    <span>{mission.title}</span>
                    <MissionTagPill tag={mission.tag} />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Today's Missions */}
        {todayMissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className={`text-sm font-semibold ${textClass} tracking-tight`}>Today's Missions</h2>
            <div className={`rounded-lg border border-dashed backdrop-blur-sm shadow-sm ${
              darkMode 
                ? "bg-neutral-800/80 border-neutral-700" 
                : "bg-white/80 border-neutral-200"
            }`}>
              {todayMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`px-3 py-3 border-b border-dashed ${
                    darkMode ? "border-neutral-700" : "border-neutral-200"
                  } last:border-b-0`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      mission.completed
                        ? "bg-orange-500 border-orange-500"
                        : darkMode ? "border-neutral-600" : "border-neutral-300"
                    }`}>
                      {mission.completed && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-medium ${
                          mission.completed 
                            ? `${textMutedClass} line-through` 
                            : textClass
                        }`}>
                          {mission.title}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            darkMode
                              ? "text-neutral-400 bg-neutral-700 border-neutral-600"
                              : "text-neutral-500 bg-neutral-100 border-neutral-200"
                          } border`}>
                            {mission.duration}m
                          </div>
                          <MissionTagPill tag={mission.tag} />
                        </div>
                      </div>
                      {mission.why && (
                        <p className={`text-xs ${textLightClass} mt-1`}>{mission.why}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center space-y-2 py-5"
        >
          {completedToday === todayMissions.length && todayMissions.length > 0 ? (
            <>
              <p className={`text-base font-semibold ${textClass} tracking-tight`}>Amazing work today! 🎉</p>
              <p className={`text-sm ${textMutedClass}`}>You completed all your missions.</p>
            </>
          ) : completedToday > 0 ? (
            <>
              <p className={`text-base font-semibold ${textClass} tracking-tight`}>You showed up today.</p>
              <p className={`text-sm ${textMutedClass}`}>Tiny step, real progress.</p>
            </>
          ) : (
            <>
              <p className={`text-base font-semibold ${textClass} tracking-tight`}>Ready when you are.</p>
              <p className={`text-sm ${textMutedClass}`}>Every journey starts with showing up.</p>
            </>
          )}
        </motion.div>
      </div>

      {/* Heatmap Modal */}
      <Heatmap 
        history={history} 
        isOpen={showHeatmap} 
        onClose={() => setShowHeatmap(false)} 
      />
    </div>
  );
}
