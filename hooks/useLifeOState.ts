import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

declare const chrome: any;

interface LifeOState {
  currentPage: 'plan' | 'focus' | 'dashboard';
  momentumBar: { show: boolean };
  weeklyBox: { show: boolean };
  focusWindow: number;
  darkMode: boolean;
  setPage: (page: 'plan' | 'focus' | 'dashboard') => void;
  setMomentumBar: (show: boolean) => void;
  setWeeklyBox: (show: boolean) => void;
  setFocusWindow: (index: number) => void;
  toggleDarkMode: () => void;
}

const storage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local
  ? {
      getItem: (name: string): Promise<string | null> => {
        return new Promise((resolve) => {
          chrome.storage.local.get(name, (result: any) => {
            resolve(result[name] ? JSON.stringify(result[name]) : null);
          });
        });
      },
      setItem: (name: string, value: string): Promise<void> => {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [name]: JSON.parse(value) }, () => resolve());
        });
      },
      removeItem: (name: string): Promise<void> => {
        return new Promise((resolve) => {
          chrome.storage.local.remove(name, () => resolve());
        });
      },
    }
  : undefined;

export const useLifeOStore = create<LifeOState>()(
  persist(
    (set) => ({
      currentPage: 'plan',
      momentumBar: { show: true },
      weeklyBox: { show: true },
      focusWindow: 0,
      darkMode: false, // Default to light mode
      setPage: (page) => set({ currentPage: page }),
      setMomentumBar: (show) => set({ momentumBar: { show } }),
      setWeeklyBox: (show) => set({ weeklyBox: { show } }),
      setFocusWindow: (index) => set({ focusWindow: index }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'lifeOUIState',
      storage: storage ? createJSONStorage(() => storage as any) : undefined,
    }
  )
);

export async function hydrateLifeOState() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const result = await new Promise<any>((resolve) => {
        chrome.storage.local.get('lifeOUIState', resolve);
      });
      
      if (result.lifeOUIState) {
        const parsed = typeof result.lifeOUIState === 'string' 
          ? JSON.parse(result.lifeOUIState) 
          : result.lifeOUIState;
        
        useLifeOStore.setState({
          currentPage: parsed.currentPage || 'plan',
          momentumBar: parsed.momentumBar || { show: true },
          weeklyBox: parsed.weeklyBox || { show: true },
          focusWindow: parsed.focusWindow || 0,
          darkMode: parsed.darkMode !== undefined ? parsed.darkMode : false,
        });
      }
    } catch (error) {
      console.warn('Failed to hydrate UI state:', error);
    }
  }
}
