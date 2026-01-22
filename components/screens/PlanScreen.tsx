import { useState, useEffect, useRef } from "react";
import { Mission } from "../../utils/storage";
import { MissionTagPill } from "../MissionTagChips";
import { DarkModeToggle } from "../DarkModeToggle";
import { useLifeOStore } from "../../hooks/useLifeOState";

interface PlanScreenProps {
  missions: Mission[];
  onStartDay: () => void;
}

export function PlanScreen({ missions, onStartDay }: PlanScreenProps) {
  const { darkMode } = useLifeOStore();
  const [showGradient, setShowGradient] = useState(false);
  const totalDuration = missions.reduce((sum, m) => sum + m.duration, 0);
  
  useEffect(() => {
    const container = document.querySelector('.extension-scrollable') as HTMLElement;
    if (!container) return;

    const handleScroll = () => {
      setShowGradient(container.scrollTop > 10);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  const bgClass = darkMode 
    ? "bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"
    : "bg-gradient-to-br from-neutral-50 via-white to-neutral-50";
  const cardClass = darkMode
    ? "border-neutral-700 bg-neutral-800/80"
    : "border-neutral-200 bg-white/80";
  const textClass = darkMode ? "text-white" : "text-neutral-900";
  const textMutedClass = darkMode ? "text-neutral-400" : "text-neutral-600";
  
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
      
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className={`text-lg font-semibold ${textClass}`}>Today's Plan</h1>
          <DarkModeToggle />
        </div>
        
        <div className="space-y-1">
          <p className={`text-xs font-medium ${textMutedClass}`}>
            {missions.length} {missions.length === 1 ? 'mission' : 'missions'} • {totalDuration} min total
          </p>
          <p className={`text-[11px] ${textMutedClass} italic`}>
            You showed up today.
          </p>
        </div>
        
        <div className={`rounded-lg border border-dashed backdrop-blur-sm shadow-sm ${
          darkMode 
            ? "bg-neutral-800/80 border-neutral-700" 
            : "bg-white/80 border-neutral-200"
        }`}>
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`px-3 py-3 border-b border-dashed ${
                darkMode ? "border-neutral-700" : "border-neutral-200"
              } last:border-b-0`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-xs font-medium ${
                      mission.completed 
                        ? `${textMutedClass} line-through` 
                        : textClass
                    }`}>
                      {mission.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                        darkMode
                          ? "text-neutral-400 bg-neutral-700 border-neutral-600"
                          : "text-neutral-500 bg-neutral-100 border-neutral-200"
                      }`}>
                        {mission.duration}m
                      </div>
                      <MissionTagPill tag={mission.tag} />
                    </div>
                  </div>
                  {mission.why && (
                    <p className={`text-xs ${textMutedClass}`}>{mission.why}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={onStartDay}
          className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all shadow-md shadow-orange-500/20"
        >
          Start day
        </button>
      </div>
    </div>
  );
}
