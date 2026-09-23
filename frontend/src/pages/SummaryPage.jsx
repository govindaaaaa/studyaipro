import { useState, useEffect } from 'react';
import { api } from '../api';

export default function SummaryPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [summaryType, setSummaryType] = useState('tldr');
  const [summary, setSummary] = useState('');
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

  const generateSummary = async () => {
    if (!selectedSession) return;
    setLoading(true);
    setSummary('');
    try {
      const data = await api.generateSummary(selectedSession, summaryType, 500);
      setSummary(data.summary);
    } catch (error) {
      alert('Failed to generate summary: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">📋 Summary Generator</h1>
          <p className="text-gray-600">Get quick summaries of your documents</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Document
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Choose a document...</option>
              {sessions.map(s => (
                <option key={s.session_id} value={s.session_id}>
                  {s.filename} ({new Date(s.created_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Summary Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'tldr', icon: '⚡', label: 'TL;DR' },
                { value: 'keypoints', icon: '🔑', label: 'Key Points' },
                { value: 'detailed', icon: '📖', label: 'Detailed' },
                { value: 'eli5', icon: '👶', label: 'ELI5' }
              ].map(({ value, icon, label }) => (
                <button
                  key={value}
                  onClick={() => setSummaryType(value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    summaryType === value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-sm font-semibold">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateSummary}
            disabled={!selectedSession || loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Generating Summary...' : '✨ Generate Summary'}
          </button>
        </div>

        {summary && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-indigo-900">Summary</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  alert('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all"
              >
                📋 Copy
              </button>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin text-6xl mb-4">⚡</div>
            <p className="text-xl text-indigo-600">Analyzing document and generating summary...</p>
          </div>
        )}
      </div>
    </div>
  );
}
