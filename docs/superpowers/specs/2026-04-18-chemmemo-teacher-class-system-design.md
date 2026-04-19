# ChemMemo Teacher & Class System Implementation Plan (Mock Backend LocalStorage)

## 1. Overview
We will implement a Teacher/Student class system completely modeled after a real backend, but simulated entirely using `localStorage` to avoid external dependencies. This ensures a fast, robust prototype of real-time features.

## 2. Architecture & Data Model (Mocked Database)

The mock DB will be stored in `localStorage` under the key `chemmemo-mock-db`.
It will contain arrays representing tables:

- **profiles:** `{ id, username, display_name, avatar_emoji }`
- **classes:** `{ id, teacher_id, join_code, name, created_at }`
- **class_members:** `{ class_id, student_id, joined_at }`
- **student_progress:** `{ student_id, equation_id, streak, mistakes_json, last_updated_at }`
- **student_stats:** `{ student_id, xp, mastery_rate, last_updated_at }`

## 3. Implementation Steps

1. **Service Layer (`src/services/api.ts`)**:
   - Create functions to read/write the mock tables with simulated network delay (e.g., 300ms `setTimeout`).
   - Implement `login`, `signup`, `createClass`, `joinClass`, `syncProgress`, `getClassDetails`, `getLeaderboard`.
   
2. **Auth State (`src/store/authStore.ts`)**:
   - A lightweight Zustand store just for `currentUser`.
   
3. **Auth UI (`/auth`)**:
   - A simple screen to enter username/password (mocked logic) to log in or create an account.
   - Redirect to `/` upon success.
   
4. **Profile UI Integration**:
   - Add a "班级 (Class)" section to the Profile tab.
   - If not in a class: Show `[创建班级]` and `[加入班级]` buttons.
   - If user created a class (Teacher): Show the class name and a link to `/class/:id/teacher`.
   - If user joined a class (Student): Show the class name and a link to `/class/:id/student`.
   
5. **Teacher Dashboard (`/class/:id/teacher`)**:
   - Fetch roster from `api.getClassDetails`.
   - Calculate aggregate mistake data across all students for a "Class Weakness Radar".
   - List students with their individual mastery rates.

6. **Student Leaderboard (`/class/:id/student`)**:
   - Fetch leaderboard from `api.getLeaderboard`.
   - Rank students by `mastery_rate` descending.

7. **Data Synchronization (`src/store/useStore.ts`)**:
   - Update `recordReviewResult` to call `api.syncProgress()` in the background (fire-and-forget).
   - This ensures the "Cloud DB" stays up to date as the user plays.
