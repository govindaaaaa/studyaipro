import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import NotesPage from "./pages/NotesPage";
import MCQPage from "./pages/MCQPage";
import ExplainPage from "./pages/ExplainPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BookmarksPage from "./pages/BookmarksPage";
import StudyTimerPage from "./pages/StudyTimerPage";
import SummaryPage from "./pages/SummaryPage";
import SearchPage from "./pages/SearchPage";
import AITutorPage from "./pages/AITutorPage";
import Layout from "./components/Layout";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="chat/:sessionId" element={<ChatPage />} />
            <Route path="notes/:sessionId" element={<NotesPage />} />
            <Route path="mcq/:sessionId" element={<MCQPage />} />
            <Route path="explain/:sessionId" element={<ExplainPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="study-timer" element={<StudyTimerPage />} />
            <Route path="summary" element={<SummaryPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="tutor" element={<AITutorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
