import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AITutorPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [mode, setMode] = useState('teach');
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('moderate');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSession || !topic) return;
    setLoading(true);
    setResponse('');

    try {
      let data;
      if (mode === 'teach') {
        data = await api.teachTopic(selectedSession, topic, depth);
        setResponse(data.teaching);
      } else if (mode === 'eli5') {
        data = await api.explainELI5(selectedSession, topic);
        setResponse(data.explanation);
      } else if (mode === 'quiz') {
        data = await api.quizMe(selectedSession, topic);
        setResponse(data.questions);
      } else if (mode === 'practice') {
        data = await api.generatePracticeProblems(selectedSession, topic, depth, 5);
        setResponse(data.problems);
      }
    } catch (error) {
      alert('Request failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">🧑‍🏫 AI Tutor</h1>
          <p className="text-gray-600">Interactive learning with personalized teaching</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Session Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Document
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
            >
              <option value="">Choose a document...</option>
              {sessions.map(s => (
                <option key={s.session_id} value={s.session_id}>
                  {s.filename}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Learning Mode
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'teach', icon: '🧑‍🏫', label: 'Teach Me' },
                { value: 'eli5', icon: '👶', label: 'ELI5' },
                { value: 'quiz', icon: '❓', label: 'Quiz Me' },
                { value: 'practice', icon: '✍️', label: 'Practice' }
              ].map(({ value, icon, label }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    mode === value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-sm font-semibold">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {mode === 'quiz' ? 'Topic to Quiz On' : mode === 'practice' ? 'Topic for Practice' : 'Topic to Learn'}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'photosynthesis', 'Newton's laws', 'React hooks'..."
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Depth/Difficulty */}
          {(mode === 'teach' || mode === 'practice') && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {mode === 'teach' ? 'Explanation Depth' : 'Difficulty'}
              </label>
              <div className="flex gap-3">
                {['simple', 'moderate', 'deep'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDepth(level)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                      depth === level
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedSession || !topic || loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Processing...' : '✨ Start Learning'}
          </button>
        </div>

        {/* Response */}
        {response && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-900">
                {mode === 'teach' && '📚 Teaching'}
                {mode === 'eli5' && '👶 Simple Explanation'}
                {mode === 'quiz' && '❓ Quiz Questions'}
                {mode === 'practice' && '✍️ Practice Problems'}
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(response);
                  alert('Copied!');
                }}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
              >
                📋 Copy
              </button>
            </div>
            <div className="prose max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-purple-50 p-6 rounded-xl">
                {response}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-bounce text-6xl mb-4">🧑‍🏫</div>
            <p className="text-xl text-purple-600">AI Tutor is preparing your lesson...</p>
          </div>
        )}
      </div>
    </div>
  );
}
