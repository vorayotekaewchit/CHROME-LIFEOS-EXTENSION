import { useState } from "react";
import { ChevronDown, GripVertical } from "lucide-react";
import { MissionTagPill } from "./MissionTagChips";
import { Mission } from "../utils/storage";
import { motion, AnimatePresence } from "motion/react";

interface MissionRowProps {
  mission: Mission;
  isDraggable?: boolean;
}

export function MissionRow({ mission, isDraggable = false }: MissionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="px-3 py-2.5 border-b border-dashed border-neutral-200 last:border-b-0 hover:bg-white/30 transition-colors group">
      <div className="flex items-start gap-2">
        {isDraggable && (
          <GripVertical className="w-4 h-4 text-neutral-300 mt-0.5 flex-shrink-0" />
        )}
        
        <div className="flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs font-medium transition-all truncate ${mission.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`} title={mission.title}>
                {mission.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="neumorphic-inset px-1.5 py-0.5 rounded text-[9px] font-bold text-neutral-400">
                {mission.duration}m
              </div>
              {mission.why && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-0.5 hover:bg-white/50 rounded-full transition-colors"
                  aria-label={isExpanded ? "Collapse mission details" : "Expand mission details"}
                  title={isExpanded ? "Collapse mission details" : "Expand mission details"}
                >
                  <ChevronDown className={`w-2.5 h-2.5 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <MissionTagPill tag={mission.tag} />
          </div>
          
          <AnimatePresence>
            {isExpanded && mission.why && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-neutral-500 pt-0.5">
                  {mission.why}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
