import { Moon, Sun } from "lucide-react";
import { useLifeOStore } from "../hooks/useLifeOState";

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useLifeOStore();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-1.5 rounded-lg transition-colors ${
        darkMode
          ? "hover:bg-neutral-700/50 text-neutral-300"
          : "hover:bg-neutral-100 text-neutral-600"
      }`}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
