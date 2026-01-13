interface MomentumRowProps {
  last7Days: number[]; // Array of mission counts for last 7 days
}

export function MomentumRow({ last7Days }: MomentumRowProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="space-y-3">
      <h3 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Momentum</h3>
      <div className="grid grid-cols-7 gap-0.5">
        {last7Days.map((count, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5">
            <div 
              className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                count === 0 
                  ? 'border-neutral-100 bg-white/50'
                  : count === 1 
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-blue-500 bg-blue-500 text-white shadow-sm'
              }`}
            >
              <span className={`text-[9px] font-bold ${count >= 2 ? 'text-white' : 'text-neutral-400'}`}>
                {count > 0 ? count : ''}
              </span>
            </div>
            <span className="text-[8px] font-bold text-neutral-300">{days[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
