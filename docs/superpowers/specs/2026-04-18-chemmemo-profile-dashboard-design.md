# ChemMemo Profile Dashboard Spec

## Context
The user requested an expansion of the "Profile" (档案) page to provide better insights into their progress, weaknesses, and habits, encouraging long-term retention of chemical equations. The chosen approach is a comprehensive dashboard (Option D) containing three main sections: Progress Matrix, Weakness Radar, and a Habit Calendar.

## 1. Overview
The Profile page (`src/pages/Profile.tsx`) will be refactored from a simple static achievement list into a dynamic, data-rich dashboard. It will read directly from the Zustand store's `reviewItems`, `dailyReviews`, and `levels` state.

## 2. Component Sections

### Section A: General Stats (Header)
- **Content:** Total XP, Current Streak, Total Equations Encountered, Mastery Rate (%).
- **Calculation:** Mastery is calculated by checking the ratio of `reviewItems` that have a streak >= 3 vs the total number of equations.

### Section B: Progress Focus (掌握度矩阵)
- **UI Element:** Progress bars grouped by Chapter (Level).
- **Logic:** 
  - For each Level in `levels`, fetch the associated `equations`.
  - Check each equation against `reviewItems`.
  - Count how many are:
    - Not Started (not in `reviewItems`)
    - Learning (in `reviewItems` but streak < 3)
    - Mastered (in `reviewItems` with streak >= 3)
  - Render a small stacked progress bar for each level.

### Section C: Weakness Diagnosis (薄弱点诊断)
- **UI Element:** A Radar (Spider) Chart displaying the distribution of `MistakeTag` frequencies.
- **Logic:**
  - Aggregate all `wrongCounts` from all `reviewItems`.
  - Categories: 反应条件遗漏 (condition_missing), 反应条件错误 (condition_wrong), 物质符号错误 (symbol_missing_or_wrong), 产物写错 (products_wrong), 配平错误 (balance_wrong).
  - Use `recharts` library (will need to install `recharts` via pnpm).

### Section D: Habit Calendar (学习日历)
- **UI Element:** A standard monthly calendar view (Current Month).
- **Logic:**
  - Build a grid for the current month.
  - Highlight days where `dailyReviews[date].doneCount > 0`.
  - Color intensity can scale with `doneCount` (e.g., light green for 1-10, dark green for > 10).
  - Show a small tooltip/popover with exact numbers on click/hover.

## 3. Technical Changes
1. **Dependencies:** Add `recharts` and `date-fns` (for easier calendar logic) to package.json.
2. **Store (`useStore.ts`):** 
   - Add a helper `getGlobalStats()` to aggregate all `wrongCounts` and mastery percentages across all equations.
3. **UI Components:**
   - Create `src/components/profile/ProgressMatrix.tsx`
   - Create `src/components/profile/WeaknessRadar.tsx`
   - Create `src/components/profile/HabitCalendar.tsx`
   - Refactor `src/pages/Profile.tsx` to import and layout these sub-components.

## 4. Dependencies
```bash
pnpm install recharts date-fns
```

## 5. Potential Issues
- **Empty State:** If the user has just started, the radar chart will have no data. We must provide a fallback "开始练习以生成诊断" message.
