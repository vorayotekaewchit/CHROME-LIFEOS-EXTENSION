import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mission } from "../../utils/storage";
import { Smile, Meh, Frown } from "lucide-react";
import { useLifeOStore } from "../../hooks/useLifeOState";
import { DarkModeToggle } from "../DarkModeToggle";

interface FocusScreenProps {
  missions: Mission[];
  onCompleteMission: (missionId: string, feeling?: "good" | "neutral" | "bad") => void;
  onSkipMission: (missionId: string) => void;
  onFinishDay: () => void;
}

export function FocusScreen({ 
  missions, 
  onCompleteMission, 
  onSkipMission,
  onFinishDay
}: FocusScreenProps) {
  const { focusWindow, setFocusWindow, darkMode } = useLifeOStore();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showXPBurst, setShowXPBurst] = useState(false);
  const [showGradient, setShowGradient] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reflectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowGradient(container.scrollTop > 10);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  const currentIndex = useMemo(() => {
    if (focusWindow >= 0 && focusWindow < missions.length && !missions[focusWindow]?.completed) {
      return focusWindow;
    }
    const firstIncomplete = missions.findIndex(m => !m.completed);
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  }, [focusWindow, missions]);
  
  const currentMission = missions[currentIndex];
  const progress = useMemo(() => {
    if (timeRemaining > 0 && currentMission) {
      return ((currentMission.duration * 60 - timeRemaining) / (currentMission.duration * 60)) * 100;
    }
    return 0;
  }, [timeRemaining, currentMission]);
  
  useEffect(() => {
    if (currentMission && !currentMission.completed) {
      setTimeRemaining(currentMission.duration * 60);
      setIsRunning(false);
    }
  }, [currentIndex]);
  
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0 && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setIsRunning(false);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (reflectionTimeoutRef.current) clearTimeout(reflectionTimeoutRef.current);
    };
  }, []);
  
  useEffect(() => {
    const container = document.querySelector('.extension-scrollable') as HTMLElement;
    if (!container) return;

    const handleScroll = () => {
      setShowGradient(container.scrollTop > 10);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleComplete = () => {
    setIsRunning(false);
    setShowReflection(true);
  };
  
  const handleReflection = (feeling: "good" | "neutral" | "bad") => {
    if (reflectionTimeoutRef.current) {
      clearTimeout(reflectionTimeoutRef.current);
    }
    
    setShowXPBurst(true);
    reflectionTimeoutRef.current = setTimeout(() => {
      onCompleteMission(currentMission.id, feeling);
      setShowReflection(false);
      setShowXPBurst(false);
      
      if (currentIndex < missions.length - 1) {
        setFocusWindow(currentIndex + 1);
      } else {
        onFinishDay();
      }
      
      reflectionTimeoutRef.current = null;
    }, 1500);
  };
  
  const handleSkip = () => {
    setIsRunning(false);
    onSkipMission(currentMission.id);
    
    if (currentIndex < missions.length - 1) {
      setFocusWindow(currentIndex + 1);
    } else {
      onFinishDay();
    }
  };
  
  if (!currentMission) {
    const bgClass = darkMode 
      ? "bg-gradient-to-br from-neutral-900 to-neutral-800"
      : "bg-gradient-to-br from-neutral-50 to-white";
    const textClass = darkMode ? "text-white" : "text-neutral-900";
    const textMutedClass = darkMode ? "text-neutral-400" : "text-neutral-600";
    
    return (
      <div className={`min-h-full ${bgClass} flex items-center justify-center px-4`}>
        <div className="text-center space-y-4 max-w-xs">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className={`text-lg font-semibold ${textClass}`}>All done!</h2>
          <p className={`text-sm ${textMutedClass}`}>Check your dashboard to see your progress.</p>
        </div>
      </div>
    );
  }
  
  const bgClass = darkMode 
    ? "bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"
    : "bg-gradient-to-br from-neutral-50 via-white to-neutral-50";
  const textClass = darkMode ? "text-white" : "text-neutral-900";
  const textMutedClass = darkMode ? "text-neutral-400" : "text-neutral-600";
  const completedCount = missions.filter(m => m.completed).length;
  
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
      
      <div className="max-w-md mx-auto px-4 py-4 pb-14">
        <div className="flex items-center justify-between mb-4">
          <div className={`text-xs font-medium ${textMutedClass}`}>
            Mission {currentIndex + 1} of {missions.length}
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs font-medium ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
              {completedCount} completed
            </div>
            <DarkModeToggle />
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className={`h-1.5 rounded-full overflow-hidden shadow-inner ${
            darkMode ? "bg-neutral-700" : "bg-neutral-100"
          }`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / missions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
            />
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMission.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="text-center space-y-4 mb-6"
          >
            <div className="space-y-2">
              <h1 className={`text-xl font-semibold ${textClass} tracking-tight`}>{currentMission.title}</h1>
              {currentMission.why && (
                <p className={`text-sm ${textMutedClass} leading-relaxed`}>{currentMission.why}</p>
              )}
            </div>
            
            <div className="relative inline-flex items-center justify-center mb-2">
              <svg className="w-36 h-36 -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="66"
                  className={`fill-none ${darkMode ? "stroke-neutral-700" : "stroke-neutral-100"}`}
                  strokeWidth="5"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="66"
                  className="fill-none stroke-orange-500"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 415" }}
                  animate={{ strokeDasharray: `${(progress / 100) * 415} 415` }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold tabular-nums tracking-tight ${textClass}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <div className={`text-xs font-medium ${textMutedClass} mt-1`}>
                    {currentMission.duration} min
                  </div>
                </div>
              </div>
            </div>
            
            {!isRunning && timeRemaining > 0 && (
              <button
                onClick={() => setIsRunning(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
              >
                Start timer
              </button>
            )}
            
            {isRunning && (
              <button
                onClick={() => setIsRunning(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  darkMode
                    ? "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Pause
              </button>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="space-y-2">
          <button
            onClick={handleComplete}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"
          >
            Complete mission
          </button>
          
          <button
            onClick={handleSkip}
            className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
              darkMode
                ? "border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Not today → Move on
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showReflection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border ${
                darkMode
                  ? "bg-neutral-800 border-neutral-700"
                  : "bg-white border-neutral-100"
              }`}
            >
              {showXPBurst && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"
                >
                  +1 Momentum
                </motion.div>
              )}
              
              {!showXPBurst && (
                <>
                  <h2 className={`text-lg font-semibold tracking-tight ${textClass}`}>How did that feel?</h2>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleReflection("bad")}
                      className={`p-3.5 rounded-full transition-all ${
                        darkMode
                          ? "hover:bg-neutral-700"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      <Frown className="w-9 h-9 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleReflection("neutral")}
                      className={`p-3.5 rounded-full transition-all ${
                        darkMode
                          ? "hover:bg-neutral-700"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      <Meh className="w-9 h-9 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleReflection("good")}
                      className="p-3.5 rounded-full hover:bg-orange-500/20 transition-all"
                    >
                      <Smile className="w-9 h-9 text-orange-500" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
