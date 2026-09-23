import { useState, useEffect } from 'react';
import { api } from '../api';

export default function StudyTimerPage() {
  const [activeSession, setActiveSession] = useState(null);
  const [stats, setStats] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessionType, setSessionType] = useState('study');

  useEffect(() => {
    checkActiveSession();
    fetchStats();
  }, []);

  useEffect(() => {
    let interval;
    if (activeSession) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const checkActiveSession = async () => {
    try {
      const data = await api.getActiveStudySession();
      if (data.active) {
        setActiveSession(data.session);
        setElapsed(data.elapsed_minutes * 60);
      }
    } catch (error) {
      console.error('Failed to check active session:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getStudyStats(7);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const startSession = async () => {
    try {
      const data = await api.startStudySession(sessionType);
      setActiveSession(data);
      setElapsed(0);
    } catch (error) {
      alert('Failed to start session');
    }
  };

  const endSession = async (rating) => {
    if (!activeSession) return;
    try {
      await api.endStudySession(activeSession.session_id, rating);
      setActiveSession(null);
      setElapsed(0);
      fetchStats();
      alert('Session completed! 🎉');
    } catch (error) {
      alert('Failed to end session');
    }
  };

  const takeBreak = async () => {
    if (!activeSession) return;
    try {
      await api.addBreak(activeSession.session_id);
      alert('Break recorded! 🧘‍♂️');
    } catch (error) {
      console.error('Failed to record break');
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">⏰ Study Timer</h1>
          <p className="text-gray-600">Track your study time and stay productive</p>
        </div>

        {/* Active Session */}
        {activeSession ? (
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl shadow-2xl p-8 mb-6 text-white">
            <div className="text-center mb-8">
              <p className="text-xl mb-4 opacity-90">Session Active</p>
              <div className="text-7xl font-bold mb-2">{formatTime(elapsed)}</div>
              <p className="text-green-200 capitalize">{sessionType} session</p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={takeBreak}
                className="px-6 py-3 bg-white/20 rounded-xl font-semibold hover:bg-white/30 transition-all"
              >
                ☕ Take Break
              </button>
              <button
                onClick={() => endSession(5)}
                className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all"
              >
                ✅ End Session
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-green-200 mb-3">How productive was this session?</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => endSession(rating)}
                    className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                  >
                    {rating}⭐
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-green-900 mb-6">Start New Session</h2>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {[
                { type: 'study', icon: '📚', label: 'Study' },
                { type: 'pomodoro', icon: '🍅', label: 'Pomodoro' },
                { type: 'review', icon: '📖', label: 'Review' },
                { type: 'practice', icon: '✍️', label: 'Practice' }
              ].map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => setSessionType(type)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    sessionType === type
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{icon}</div>
                  <div className="font-semibold">{label}</div>
                </button>
              ))}
            </div>
            <button
              onClick={startSession}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
            >
              🚀 Start Session
            </button>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-3xl font-bold text-green-900">{stats.summary.total_sessions}</div>
              <div className="text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-3xl font-bold text-blue-900">{stats.summary.total_hours}h</div>
              <div className="text-gray-600">Total Hours</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-3xl font-bold text-purple-900">{stats.summary.avg_session_length}min</div>
              <div className="text-gray-600">Avg Session</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-orange-900">{stats.summary.avg_productivity}</div>
              <div className="text-gray-600">Avg Productivity</div>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {stats && stats.recent_sessions && stats.recent_sessions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-green-900 mb-6">📝 Recent Sessions</h2>
            <div className="space-y-3">
              {stats.recent_sessions.map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold capitalize">{session.type} Session</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.start).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-900">{session.duration} min</p>
                    <p className="text-sm text-gray-500">
                      {session.completed ? '✅ Completed' : '⏳ In Progress'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
