import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-indigo-600">📚 StudyAI Pro</h1>
          <p className="text-xs text-gray-500 mt-1">Welcome, {user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" active={location.pathname === "/dashboard"}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/search" active={location.pathname === "/search"}>
            🔍 Search
          </NavLink>
          
          <div className="pt-3 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Study Tools</p>
          </div>
          
          <NavLink to="/flashcards" active={location.pathname === "/flashcards"}>
            🎴 Flashcards
          </NavLink>
          <NavLink to="/summary" active={location.pathname === "/summary"}>
            📋 Summaries
          </NavLink>
          <NavLink to="/tutor" active={location.pathname === "/tutor"}>
            🧑‍🏫 AI Tutor
          </NavLink>
          <NavLink to="/study-timer" active={location.pathname === "/study-timer"}>
            ⏰ Study Timer
          </NavLink>
          
          <div className="pt-3 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</p>
          </div>
          
          <NavLink to="/analytics" active={location.pathname === "/analytics"}>
            📊 Analytics
          </NavLink>
          <NavLink to="/bookmarks" active={location.pathname === "/bookmarks"}>
            ⭐ Bookmarks
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}
