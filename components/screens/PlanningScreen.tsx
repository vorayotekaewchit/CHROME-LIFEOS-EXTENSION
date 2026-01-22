import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { MissionTagChips } from '../MissionTagChips';
import { DarkModeToggle } from '../DarkModeToggle';
import { useLifeOStore } from '../../hooks/useLifeOState';
import { Mission, MissionTag } from '../../utils/storage';

type PlanningScreenProps = {
  onGeneratePlan: (missions: Mission[]) => void;
};

interface DraftMission {
  title: string;
  tag?: MissionTag;
  why?: string;
}

export function PlanningScreen({ onGeneratePlan }: PlanningScreenProps) {
  const { darkMode } = useLifeOStore();
  const [missions, setMissions] = useState<DraftMission[]>([]);
  const [currentMission, setCurrentMission] = useState<Partial<DraftMission>>({});

  const addMission = () => {
    if (currentMission.title && currentMission.tag) {
      setMissions([...missions, currentMission as DraftMission]);
      setCurrentMission({});
    }
  };

  const removeMission = (index: number) => {
    setMissions(missions.filter((_, i) => i !== index));
  };

  const handleGeneratePlan = () => {
    const finalMissions: Mission[] = missions.map((m, idx) => ({
      id: `mission-${Date.now()}-${idx}`,
      title: m.title,
      tag: m.tag!,
      duration: Math.floor(Math.random() * 11) + 15, // 15-25 mins
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
  const textMutedClass = darkMode ? "text-neutral-400" : "text-neutral-700";
  const inputClass = darkMode
    ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:ring-orange-500"
    : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-500 focus:ring-orange-500";

  return (
    <div className={`flex flex-col min-h-full ${bgClass}`}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className={`text-xl font-semibold ${textClass}`}>Plan Your Day</h1>
            <p className={`text-sm ${textMutedClass} mt-1`}>Three missions a day. That's it.</p>
          </div>
          <DarkModeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 space-y-4 overflow-y-auto">
        {/* Added Missions */}
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

        {/* Add Mission Form */}
        {missions.length < 3 && (
          <div className={`space-y-4 p-6 rounded-xl border-2 border-dashed ${cardClass}`}>
            <div>
              <label className={`block ${textMutedClass} mb-2`}>Mission {missions.length + 1}</label>
              <input
                type="text"
                value={currentMission.title || ""}
                onChange={(e) => setCurrentMission({ ...currentMission, title: e.target.value })}
                placeholder="e.g., Write first draft of proposal"
                className={`w-full px-4 py-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:border-transparent`}
              />
            </div>
            
            <div>
              <label className={`block ${textMutedClass} mb-2`}>Tag</label>
              <MissionTagChips
                selectedTag={currentMission.tag}
                onSelect={(tag) => setCurrentMission({ ...currentMission, tag })}
              />
            </div>
            
            <div>
              <label className={`block ${textMutedClass} mb-2`}>
                Why? (optional)
              </label>
              <textarea
                value={currentMission.why || ""}
                onChange={(e) => setCurrentMission({ ...currentMission, why: e.target.value })}
                placeholder="Helps keep motivation clear"
                className={`w-full px-4 py-3 rounded-lg border ${inputClass} focus:outline-none focus:ring-2 focus:border-transparent resize-none`}
                rows={2}
              />
            </div>
            
            <button
              onClick={addMission}
              disabled={!currentMission.title || !currentMission.tag}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Mission
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {missions.length > 0 && (
        <div className="px-6 pb-8">
          <button
            onClick={handleGeneratePlan}
            className={`w-full py-4 ${darkMode ? "bg-orange-500 hover:bg-orange-600" : "bg-neutral-900 hover:bg-neutral-800"} text-white rounded-2xl transition-colors font-medium text-base`}
          >
            Generate Plan
          </button>
        </div>
      )}
    </div>
  );
}
