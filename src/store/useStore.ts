import { create } from 'zustand';
import { api } from '../services/api';
import { useAuthStore } from './authStore';
import { persist } from 'zustand/middleware';
import { initialLevels } from '../data/levels';
import { equations } from '../data/equations';
import { Level, MistakeTag } from '../types';

function migrateLocalStorageKey(fromKey: string, toKey: string) {
  if (typeof window === 'undefined') return;
  try {
    const toValue = window.localStorage.getItem(toKey);
    if (toValue) return;
    const fromValue = window.localStorage.getItem(fromKey);
    if (!fromValue) return;
    window.localStorage.setItem(toKey, fromValue);
  } catch {
    return;
  }
}

const STORAGE_KEY = 'chemmemo-storage';
const LEGACY_STORAGE_KEY = 'chemlingo-storage';

migrateLocalStorageKey(LEGACY_STORAGE_KEY, STORAGE_KEY);

interface StoreState {
  xp: number;
  streak: number;
  hearts: number;
  levels: Level[];
  lastPlayDate: string | null;
  reviewItems: Record<string, ReviewItem>;
  dailyReviews: Record<string, DailyReview>;
  addXp: (amount: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  completeLevel: (levelId: string) => void;
  updateStreak: () => void;
  recordReviewResult: (args: { equationId: string; correct: boolean; tags: MistakeTag[]; source?: 'review' | 'practice' }) => void;
  getTodayReviewSummary: () => {
    date: string;
    targetCount: number;
    doneCount: number;
    correctCount: number;
    dueCount: number;
    weakCounts: Record<MistakeTag, number>;
  };
  buildTodayReviewPlan: () => { equationIds: string[]; dueIds: string[]; weakIds: string[]; newIds: string[] };
  getGlobalStats: () => {
    totalEquations: number;
    masteredCount: number;
    learningCount: number;
    notStartedCount: number;
    totalMistakes: Record<MistakeTag, number>;
  };
}

interface ReviewItem {
  equationId: string;
  nextDueAt: string;
  streak: number;
  wrongCounts: Record<MistakeTag, number>;
  lastResultAt: string;
}

interface DailyReview {
  date: string;
  targetCount: number;
  doneCount: number;
  correctCount: number;
  mistakes: Record<MistakeTag, number>;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function addDays(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function nextIntervalDays(streak: number) {
  if (streak <= 1) return 1;
  if (streak === 2) return 3;
  if (streak === 3) return 7;
  return 14;
}

function emptyWrongCounts(): Record<MistakeTag, number> {
  return {
    condition_missing: 0,
    condition_wrong: 0,
    symbol_missing_or_wrong: 0,
    products_wrong: 0,
    balance_wrong: 0,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      hearts: 5,
      levels: initialLevels,
      lastPlayDate: null,
      reviewItems: {},
      dailyReviews: {},

      addXp: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
        const user = useAuthStore.getState().user;
        if (user) {
          const stats = get().getGlobalStats();
          const mastery_rate = stats.totalEquations > 0 ? (stats.masteredCount / stats.totalEquations) * 100 : 0;
          api.syncProgress(
            user.id,
            { equation_id: 'xp-update', streak: 0, wrong_counts: {} },
            { xp: get().xp, mastery_rate }
          ).catch(console.error);
        }
      },
      
      loseHeart: () =>
        set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),
      
      refillHearts: () => set({ hearts: 5 }),
      
      completeLevel: (levelId) =>
        set((state) => {
          const newLevels = state.levels.map((lvl, index) => {
            if (lvl.id === levelId) {
              return { ...lvl, isCompleted: true };
            }
            // Unlock next level
            if (index > 0 && state.levels[index - 1].id === levelId) {
              return { ...lvl, isUnlocked: true };
            }
            return lvl;
          });
          return { levels: newLevels };
        }),
        
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastPlay = get().lastPlayDate;
        
        if (lastPlay !== today) {
          if (lastPlay) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastPlay === yesterday.toISOString().split('T')[0]) {
              set((state) => ({ streak: state.streak + 1, lastPlayDate: today }));
            } else {
              set({ streak: 1, lastPlayDate: today });
            }
          } else {
            set({ streak: 1, lastPlayDate: today });
          }
        }
      },

      recordReviewResult: ({ equationId, correct, tags, source = 'practice' }) => {
        const today = todayStr();
        const now = new Date().toISOString();
        const existing = get().reviewItems[equationId];

        const current: ReviewItem = existing ?? {
          equationId,
          nextDueAt: today,
          streak: 0,
          wrongCounts: emptyWrongCounts(),
          lastResultAt: now,
        };

        const nextStreak = correct ? current.streak + 1 : 1;
        const nextDueAt = correct ? addDays(today, nextIntervalDays(nextStreak)) : addDays(today, 1);

        const nextWrongCounts = { ...current.wrongCounts };
        if (!correct) {
          tags.forEach((t) => {
            nextWrongCounts[t] = (nextWrongCounts[t] ?? 0) + 1;
          });
        }

        const nextItem: ReviewItem = {
          ...current,
          streak: nextStreak,
          nextDueAt,
          wrongCounts: nextWrongCounts,
          lastResultAt: now,
        };

        if (source === 'review') {
          const existingDaily = get().dailyReviews[today];
          const daily: DailyReview = existingDaily ?? {
            date: today,
            targetCount: 10,
            doneCount: 0,
            correctCount: 0,
            mistakes: emptyWrongCounts(),
          };

          const nextMistakes = { ...daily.mistakes };
          if (!correct) {
            tags.forEach((t) => {
              nextMistakes[t] = (nextMistakes[t] ?? 0) + 1;
            });
          }

          const nextDaily: DailyReview = {
            ...daily,
            doneCount: daily.doneCount + 1,
            correctCount: daily.correctCount + (correct ? 1 : 0),
            mistakes: nextMistakes,
          };

          set((state) => ({
            reviewItems: { ...state.reviewItems, [equationId]: nextItem },
            dailyReviews: { ...state.dailyReviews, [today]: nextDaily },
          }));
        } else {
          set((state) => ({
            reviewItems: { ...state.reviewItems, [equationId]: nextItem },
          }));
        }

        // Background sync to mock DB
        const user = useAuthStore.getState().user;
        if (user) {
          const stats = get().getGlobalStats();
          const mastery_rate = stats.totalEquations > 0 ? (stats.masteredCount / stats.totalEquations) * 100 : 0;
          api.syncProgress(
            user.id,
            { equation_id: equationId, streak: nextStreak, wrong_counts: nextWrongCounts },
            { xp: get().xp, mastery_rate }
          ).catch(console.error);
        }
      },

      getTodayReviewSummary: () => {
        const today = todayStr();
        const daily = get().dailyReviews[today] ?? {
          date: today,
          targetCount: 10,
          doneCount: 0,
          correctCount: 0,
          mistakes: emptyWrongCounts(),
        };

        const items = Object.values(get().reviewItems);
        const dueCount = items.filter((i) => i.nextDueAt <= today).length;

        const weakCounts = items.reduce((acc, item) => {
          (Object.keys(item.wrongCounts) as MistakeTag[]).forEach((k) => {
            acc[k] += item.wrongCounts[k] ?? 0;
          });
          return acc;
        }, emptyWrongCounts());

        return {
          date: today,
          targetCount: daily.targetCount,
          doneCount: daily.doneCount,
          correctCount: daily.correctCount,
          dueCount,
          weakCounts,
        };
      },

      buildTodayReviewPlan: () => {
        const today = todayStr();
        const allEquationIds = equations.map((e) => e.id);
        const items = get().reviewItems;
        const dueIds = allEquationIds.filter((id) => (items[id]?.nextDueAt ?? today) <= today);
        const newIds = allEquationIds.filter((id) => !items[id]);

        const scored = allEquationIds
          .map((id) => {
            const wc = items[id]?.wrongCounts ?? emptyWrongCounts();
            const score = (Object.keys(wc) as MistakeTag[]).reduce((s, k) => s + (wc[k] ?? 0), 0);
            return { id, score };
          })
          .filter((x) => x.score > 0 && !dueIds.includes(x.id))
          .sort((a, b) => b.score - a.score);

        const weakIds = scored.map((x) => x.id);

        const pick: string[] = [];
        const target = 10;

        for (const id of dueIds) {
          if (pick.length >= target) break;
          if (!pick.includes(id)) pick.push(id);
        }
        for (const id of weakIds) {
          if (pick.length >= target) break;
          if (!pick.includes(id)) pick.push(id);
        }
        for (const id of newIds) {
          if (pick.length >= target) break;
          if (!pick.includes(id)) pick.push(id);
        }

        return { equationIds: pick, dueIds, weakIds, newIds };
      },

      getGlobalStats: () => {
        const totalEquations = equations.length;
        const items = Object.values(get().reviewItems);
        
        let masteredCount = 0;
        let learningCount = 0;
        const totalMistakes = emptyWrongCounts();

        items.forEach((item) => {
          if (item.streak >= 3) {
            masteredCount++;
          } else {
            learningCount++;
          }

          (Object.keys(item.wrongCounts) as MistakeTag[]).forEach((k) => {
            totalMistakes[k] += item.wrongCounts[k] ?? 0;
          });
        });

        const notStartedCount = totalEquations - masteredCount - learningCount;

        return {
          totalEquations,
          masteredCount,
          learningCount,
          notStartedCount,
          totalMistakes,
        };
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        // Ensure all levels are unlocked when loading from local storage
        if (state) {
          state.levels = state.levels.map(l => ({ ...l, isUnlocked: true }));
        }
      }
    }
  )
);
