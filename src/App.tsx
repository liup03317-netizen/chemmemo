import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Lesson } from './pages/Lesson';
import { Review } from './pages/Review';
import { ReviewSession } from './pages/ReviewSession';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { TeacherDashboard } from './pages/class/TeacherDashboard';
import { StudentLeaderboard } from './pages/class/StudentLeaderboard';
import { useAuthStore } from './store/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F7F7F7] font-sans text-[#4B4B4B]">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/lesson/:levelId" element={<PrivateRoute><Lesson /></PrivateRoute>} />
          <Route path="/review" element={<PrivateRoute><Review /></PrivateRoute>} />
          <Route path="/review/session" element={<PrivateRoute><ReviewSession /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/class/:id/teacher" element={<PrivateRoute><TeacherDashboard /></PrivateRoute>} />
          <Route path="/class/:id/student" element={<PrivateRoute><StudentLeaderboard /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
