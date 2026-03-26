import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Map from level number → chip id it produces on completion
export const LEVEL_CHIP_MAP: Record<number, string> = {
  1: 'dot_product',
  2: 'softmax_vec',
  3: 'scaled_dot',
  4: 'attn_weights',
  5: 'attn_head',
  6: 'relu',
  7: 'ffn_relu',
  8: 'layer_norm',
  9: 'transformer_block',
};

interface ProgressState {
  unlockedLevels: number[];
  completedLevels: number[];
  unlockedChips: string[];
  completeLevel: (n: number) => void;
  unlockChip: (id: string) => void;
  isUnlocked: (n: number) => boolean;
  isCompleted: (n: number) => boolean;
  hasChip: (id: string) => boolean;
  resetProgress: () => void;
  totalCompleted: () => number;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      unlockedLevels: [1],
      completedLevels: [],
      unlockedChips: [],

      completeLevel: (n: number) => {
        const { completedLevels, unlockedLevels, unlockedChips } = get();
        const newCompleted = completedLevels.includes(n)
          ? completedLevels
          : [...completedLevels, n];
        const newUnlocked =
          unlockedLevels.includes(n + 1) || n >= 9
            ? unlockedLevels
            : [...unlockedLevels, n + 1];
        const chipId = LEVEL_CHIP_MAP[n];

        const newChips =
          chipId && !unlockedChips.includes(chipId)
            ? [...unlockedChips, chipId]
            : unlockedChips;
        set({ completedLevels: newCompleted, unlockedLevels: newUnlocked, unlockedChips: newChips });
      },

      unlockChip: (id: string) => {
        const { unlockedChips } = get();
        if (!unlockedChips.includes(id)) {
          set({ unlockedChips: [...unlockedChips, id] });
        }
      },

      isUnlocked: (n: number) => get().unlockedLevels.includes(n),
      isCompleted: (n: number) => get().completedLevels.includes(n),
      hasChip: (id: string) => get().unlockedChips.includes(id),

      resetProgress: () =>
        set({ unlockedLevels: [1], completedLevels: [], unlockedChips: [] }),

      totalCompleted: () => get().completedLevels.length,
    }),
    {
      name: 'thus-spoke-gpu-progress',
      // Migration: retroactively grant chips for any already-completed levels
      onRehydrateStorage: () => state => {
        if (!state) return;
        const missing = state.completedLevels
          .map((n: number) => LEVEL_CHIP_MAP[n])
          .filter((id: string) => id && !state.unlockedChips.includes(id));
        if (missing.length > 0) {
          state.unlockedChips = [...state.unlockedChips, ...missing];
        }
      },
    }
  )
);
