import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MissionTagChips } from "../MissionTagChips";
import { Mission, MissionTag } from "../../utils/storage";
import { DarkModeToggle } from "../DarkModeToggle";
import { useLifeOStore } from "../../hooks/useLifeOState";

interface InputScreenProps {
  onGeneratePlan: (missions: Mission[]) => void;
  yesterdayIncomplete: Mission[];
  onAddYesterdayMission: (mission: Mission) => void;
}

interface DraftMission {
  title: string;
  tag?: MissionTag;
  why?: string;
}

export function InputScreen({ onGeneratePlan, yesterdayIncomplete, onAddYesterdayMission }: InputScreenProps) {
  const [missions, setMissions] = useState<DraftMission[]>([]);
  const [currentMission, setCurrentMission] = useState<Partial<DraftMission>>({});
  const { darkMode } = useLifeOStore();
  
  const addMission = () => {
    if (currentMission.title && currentMission.tag) {
      setMissions([...missions, currentMission as DraftMission]);
      setCurrentMission({});
    }
  };
  
  const removeMission = (index: number) => {
    setMissions(missions.filter((_, i) => i !== index));
  };
  
  const handleAddYesterday = (mission: Mission) => {
    onAddYesterdayMission(mission);
    if (!missions.find(m => m.title === mission.title)) {
      setMissions([...missions, {
        title: mission.title,
        tag: mission.tag,
        why: mission.why
      }]);
    }
  };
  
  const handleGeneratePlan = () => {
    const finalMissions: Mission[] = missions.map((m, idx) => ({
      id: `mission-${Date.now()}-${idx}`,
      title: m.title,
      tag: m.tag!,
      duration: Math.floor(Math.random() * 11) + 15,
      why: m.why,
      completed: false
    }));
    onGeneratePlan(finalMissions);
  };
  
  const bgClass = darkMode 
    ? "bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900"
    : "bg-gradient-to-br from-neutral-50 via-white to-neutral-50";
  const cardClass = darkMode
    ? "border-neutral-700 bg-neutral-800/80"
    : "border-neutral-200 bg-white";
  const textClass = darkMode ? "text-white" : "text-neutral-900";
  const textMutedClass = darkMode ? "text-neutral-400" : "text-neutral-600";
  const inputClass = darkMode
    ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:ring-orange-500"
    : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-500 focus:ring-orange-500";

  return (
    <div className={`min-h-full ${bgClass}`}>
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-lg font-semibold ${textClass} mb-1`}>Pick today's missions</h1>
            <p className={`text-xs ${textMutedClass}`}>Three missions a day. That's it.</p>
          </div>
          <DarkModeToggle />
        </div>
        
        {yesterdayIncomplete.length > 0 && (
          <div className={`space-y-2 p-4 rounded-xl border ${cardClass}`}>
            <h2 className={`text-sm font-semibold ${textClass} mb-2`}>Yesterday's Incomplete</h2>
            <p className={`text-xs ${textMutedClass} mb-3`}>Complete today again?</p>
            <div className="space-y-2">
              {yesterdayIncomplete.map((mission) => (
                <button
                  key={mission.id}
                  onClick={() => handleAddYesterday(mission)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                    darkMode
                      ? "border-neutral-700 bg-neutral-700/50 hover:bg-neutral-700 hover:border-orange-500/50 text-neutral-300 hover:text-white"
                      : "border-neutral-200 bg-white hover:bg-neutral-50 hover:border-orange-300 text-neutral-700 hover:text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">+</span>
                    <span>{mission.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {missions.length > 0 && (
          <div className="space-y-2">
            {missions.map((mission, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-3 rounded-lg border ${cardClass} shadow-sm`}
              >
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${textClass} mb-0.5`}>{mission.title}</h3>
                  {mission.tag && (
                    <p className={`text-xs ${textMutedClass}`}>{mission.tag}</p>
                  )}
                </div>
                <button
                  onClick={() => removeMission(idx)}
                  className={`p-1 transition-colors ${
                    darkMode ? "text-neutral-400 hover:text-neutral-200" : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {missions.length < 3 && (
          <div className={`space-y-3 p-4 rounded-xl border-2 border-dashed ${cardClass}`}>
            <div>
              <label className={`block text-xs font-medium ${textMutedClass} mb-1.5`}>
                Mission {missions.length + 1}
              </label>
              <input
                type="text"
                value={currentMission.title || ""}
                onChange={(e) => setCurrentMission({ ...currentMission, title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentMission.title && currentMission.tag) {
                    addMission();
                  }
                }}
                placeholder="e.g., Write first draft of proposal"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:border-transparent`}
              />
            </div>
            
            <div>
              <label className={`block text-xs font-medium ${textMutedClass} mb-1.5`}>Tag</label>
              <MissionTagChips
                selectedTag={currentMission.tag}
                onSelect={(tag) => setCurrentMission({ ...currentMission, tag })}
              />
            </div>
            
            <div>
              <label className={`block text-xs font-medium ${textMutedClass} mb-1.5`}>
                Why? (optional)
              </label>
              <textarea
                value={currentMission.why || ""}
                onChange={(e) => setCurrentMission({ ...currentMission, why: e.target.value })}
                placeholder="Helps keep motivation clear"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:border-transparent resize-none`}
                rows={2}
              />
            </div>
            
            <button
              onClick={addMission}
              disabled={!currentMission.title || !currentMission.tag}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? "bg-neutral-700 text-neutral-200 hover:bg-neutral-600 active:bg-neutral-500"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Mission
            </button>
          </div>
        )}
        
        {missions.length > 0 && (
          <button
            onClick={handleGeneratePlan}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all shadow-md shadow-orange-500/20"
          >
            Generate plan
          </button>
        )}
      </div>
    </div>
  );
}
