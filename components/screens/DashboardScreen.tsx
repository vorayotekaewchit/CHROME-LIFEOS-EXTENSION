import { motion } from "motion/react";
import { MomentumRow } from "../MomentumRow";
import { MissionRow } from "../MissionRow";
import { Mission } from "../../utils/storage";
import { calculateLevel } from "../XPLevelChip";

interface DashboardScreenProps {
  missions: Mission[];
  xp: number;
  streak: number;
  last7Days: number[];
  onResetDay: () => void;
}

export function DashboardScreen({ 
  missions, 
  xp, 
  streak, 
  last7Days,
  onResetDay 
}: DashboardScreenProps) {
  const level = calculateLevel(xp);
  const completedMissions = missions.filter(m => m.completed);
  const completionRate = missions.length > 0 
    ? Math.round((completedMissions.length / missions.length) * 100) 
    : 0;
  
  return (
    <div className="min-h-full bg-[#f8fafc] px-3 py-4">
      <div className="max-w-md mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-neutral-900">Life OS</h1>
            <div className="flex gap-1.5">
              <div className="neumorphic-inset px-2 py-0.5 rounded-full text-[9px] font-bold text-orange-600">
                {streak} 🔥
              </div>
              <div className="neumorphic-inset px-2 py-0.5 rounded-full text-[9px] font-bold text-blue-600">
                LVL {level}
              </div>
            </div>
          </div>
          <div className="bg-white/40 rounded-lg p-3 border border-white/20">
            <div className="flex justify-between items-center text-[10px] text-neutral-500 mb-1">
              <span>Daily Progress</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Momentum */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-3"
        >
          <MomentumRow last7Days={last7Days} />
        </motion.div>
        
        {/* Today's missions */}
        {missions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-sm font-semibold text-neutral-900">Today's missions</h2>
            <div className="mission-card mission-card-divider">
              {missions.map((mission, idx) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  <MissionRow mission={mission} isDraggable={false} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-1 py-4"
        >
          {completedMissions.length === missions.length && missions.length > 0 ? (
            <>
              <p className="text-sm text-neutral-900">Amazing work today! 🎉</p>
              <p className="text-xs text-neutral-500">You completed all your missions.</p>
            </>
          ) : completedMissions.length > 0 ? (
            <>
              <p className="text-sm text-neutral-900">You showed up today.</p>
              <p className="text-xs text-neutral-500">Tiny step, real progress.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-900">Ready when you are.</p>
              <p className="text-xs text-neutral-500">Every journey starts with showing up.</p>
            </>
          )}
        </motion.div>
        
        {/* Reset button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onResetDay}
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-smooth"
        >
          Reset tomorrow
        </motion.button>
      </div>
    </div>
  );
}
