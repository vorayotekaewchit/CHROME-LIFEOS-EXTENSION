import { Target, Zap, ChartBar } from "lucide-react";
import { motion } from "motion/react";
import { useLifeOStore } from "../hooks/useLifeOState";

export type Tab = "plan" | "focus" | "dashboard";

interface BottomTabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const { darkMode } = useLifeOStore();
  const tabs = [
    { id: "plan" as Tab, label: "Plan", icon: Target },
    { id: "focus" as Tab, label: "Focus", icon: Zap },
    { id: "dashboard" as Tab, label: "Dashboard", icon: ChartBar }
  ];
  
  const bgClass = darkMode
    ? "bg-neutral-900/98 border-neutral-700/80"
    : "bg-white/98 border-neutral-200/80";
  
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-14 ${bgClass} backdrop-blur-lg border-t z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]`}>
      <div className="flex items-center justify-around h-full px-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-lg transition-all duration-200 relative ${
              activeTab === id 
                ? "text-orange-400 scale-105" 
                : darkMode
                  ? "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50/50"
            }`}
          >
            {activeTab === id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-orange-500/20 rounded-lg -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <Icon className={`w-4 h-4 ${activeTab === id ? 'drop-shadow-sm' : ''}`} />
            <span className={`text-[9px] font-medium ${activeTab === id ? 'font-semibold' : ''}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
