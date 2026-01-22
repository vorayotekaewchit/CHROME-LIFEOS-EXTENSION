import { Target, Heart, DollarSign, Briefcase, Users } from "lucide-react";
import { MissionTag } from "../utils/storage";
import { useLifeOStore } from "../hooks/useLifeOState";

interface MissionTagChipsProps {
  selectedTag?: MissionTag;
  onSelect: (tag: MissionTag) => void;
}

const TAGS: Array<{ name: MissionTag; icon: any; color: string; darkColor: string }> = [
  { 
    name: "Focus", 
    icon: Target, 
    color: "bg-purple-50 text-purple-600 border-purple-200",
    darkColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  },
  { 
    name: "Health", 
    icon: Heart, 
    color: "bg-green-50 text-green-600 border-green-200",
    darkColor: "bg-green-500/20 text-green-300 border-green-500/30"
  },
  { 
    name: "Money", 
    icon: DollarSign, 
    color: "bg-blue-50 text-blue-600 border-blue-200",
    darkColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  },
  { 
    name: "Admin", 
    icon: Briefcase, 
    color: "bg-orange-50 text-orange-600 border-orange-200",
    darkColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
  },
  { 
    name: "Relationships", 
    icon: Users, 
    color: "bg-pink-50 text-pink-600 border-pink-200",
    darkColor: "bg-pink-500/20 text-pink-300 border-pink-500/30"
  }
];

export function MissionTagChips({ selectedTag, onSelect }: MissionTagChipsProps) {
  const { darkMode } = useLifeOStore();
  
  return (
    <div className="flex flex-wrap gap-1.5">
      {TAGS.map(({ name, icon: Icon, color, darkColor }) => {
        const isSelected = selectedTag === name;
        const selectedStyles = darkMode ? darkColor : color;
        const unselectedStyles = darkMode
          ? "bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-700"
          : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50";
        
        return (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all duration-200 text-xs font-medium ${
              isSelected 
                ? `${selectedStyles} shadow-sm scale-105` 
                : `${unselectedStyles} hover:scale-105 active:scale-95`
            }`}
          >
            <Icon className="w-3 h-3" />
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function MissionTagPill({ tag }: { tag: MissionTag }) {
  const { darkMode } = useLifeOStore();
  const tagData = TAGS.find(t => t.name === tag);
  if (!tagData) return null;
  
  const Icon = tagData.icon;
  const styles = darkMode ? tagData.darkColor : tagData.color;
  
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border ${styles}`}>
      <Icon className="w-2.5 h-2.5" />
      {tag}
    </span>
  );
}
