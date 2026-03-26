import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        applyTheme(next);
      },
      setTheme: (t: Theme) => {
        set({ theme: t });
        applyTheme(t);
      },
    }),
    {
      name: 'thus-spoke-theme',
      onRehydrateStorage: () => state => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
