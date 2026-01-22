import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { HistoryEntry, getDateString } from "../utils/storage";

interface HeatmapProps {
  history: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export function Heatmap({ history, isOpen, onClose }: HeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size - vertical layout
    // Reduced weeks to fit the page (360px × 500px)
    const cellSize = 14;
    const cellGap = 4;
    const weeks = 20; // Reduced from 52 to fit page better
    const daysPerWeek = 7;
    // Vertical: weeks go down, days go across
    // Use full width: 360px - 32px padding = 328px available
    const availableWidth = 328;
    const labelWidth = 55;
    const cellsWidth = daysPerWeek * (cellSize + cellGap) + cellGap;
    const width = Math.max(cellsWidth + labelWidth, availableWidth);
    const height = weeks * (cellSize + cellGap) + cellGap + 40; // Extra space for month labels

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // Create a map of date -> completed count for quick lookup
    const dateMap = new Map<string, number>();
    history.forEach(entry => {
      dateMap.set(entry.date, entry.totalCompleted);
    });

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the start date (52 weeks ago from today, aligned to Sunday)
    const startDate = new Date(today);
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday
    startDate.setDate(startDate.getDate() - (weeks * 7) - dayOfWeek);

    // Draw day labels (Sun, Mon, Tue, Wed, Thu, Fri, Sat) - vertical on left
    ctx.fillStyle = "#8b949e";
    ctx.font = "10px system-ui";
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayLabels.forEach((label, day) => {
      const x = 50; // Position for day labels
      const y = day * (cellSize + cellGap) + cellGap + 30 + cellSize / 2 + 3;
      ctx.fillText(label, x, y);
    });

    // Draw cells - vertical layout
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < daysPerWeek; day++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + (week * 7) + day);

        // Skip future dates
        if (cellDate > today) continue;

        const dateStr = getDateString(cellDate);
        const completed = dateMap.get(dateStr) || 0;

        // Calculate position - vertical layout
        const x = day * (cellSize + cellGap) + cellGap + 60; // Offset for day labels
        const y = week * (cellSize + cellGap) + cellGap + 30; // Offset for month labels

        // Determine color based on completed count
        let color = "#161b22"; // No missions (dark grey)
        if (completed > 0) {
          if (completed >= 4) {
            color = "#40c463"; // 4+ missions (green)
          } else if (completed >= 1) {
            color = "#ffa500"; // 1-3 missions (orange)
          }
        }

        // Draw cell
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Add border for hover effect
        ctx.strokeStyle = hoveredDate === dateStr ? "#fff" : "transparent";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, y - 1, cellSize + 2, cellSize + 2);
      }
    }

    // Draw month labels at top
    ctx.fillStyle = "#8b949e";
    ctx.font = "10px system-ui";
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonth = -1;
    for (let week = 0; week < weeks; week++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + (week * 7));
      const month = cellDate.getMonth();
      
      if (month !== lastMonth) {
        const y = week * (cellSize + cellGap) + cellGap + 20;
        ctx.fillText(monthNames[month], 60, y);
        lastMonth = month;
      }
    }
  }, [history, isOpen, hoveredDate]);

  // Handle mouse move for hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellSize = 14;
    const cellGap = 4;
    const weeks = 20;
    const daysPerWeek = 7;

    // Vertical layout: day is from x, week is from y
    const day = Math.floor((x - cellGap - 60) / (cellSize + cellGap));
    const week = Math.floor((y - cellGap - 30) / (cellSize + cellGap));

    if (week >= 0 && week < weeks && day >= 0 && day < daysPerWeek) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today);
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - (weeks * 7) - dayOfWeek);

      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + (week * 7) + day);

      if (cellDate <= today) {
        const dateStr = getDateString(cellDate);
        setHoveredDate(dateStr);
      } else {
        setHoveredDate(null);
      }
    } else {
      setHoveredDate(null);
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const hoveredEntry = hoveredDate ? history.find(entry => entry.date === hoveredDate) : null;
  const completedCount = hoveredEntry ? hoveredEntry.totalCompleted : 0;
  const totalMissions = hoveredEntry ? hoveredEntry.missions.length : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[500px] bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">Mission History</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                title="Close"
                aria-label="Close heatmap"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-4 flex flex-col">
              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 text-sm text-neutral-400">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-[#161b22] rounded" />
                  <div className="w-3 h-3 bg-[#ffa500] rounded" />
                  <div className="w-3 h-3 bg-[#40c463] rounded" />
                </div>
                <span>More</span>
              </div>

              {/* Canvas - Fits in available space */}
              <div className="flex-1 overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoveredDate(null)}
                  className="cursor-pointer"
                />
              </div>

              {/* Tooltip */}
              {hoveredDate && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700"
                >
                  <p className="text-sm text-white font-medium">{hoveredDate}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {completedCount} / {totalMissions} missions completed
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
