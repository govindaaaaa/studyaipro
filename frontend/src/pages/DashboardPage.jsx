import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    console.log('[Dashboard] Fetching sessions...');
    api.getSessions()
      .then(data => {
        console.log('[Dashboard] Sessions received:', data);
        setSessions(data.sessions || []);
        console.log('[Dashboard] Total sessions:', data.sessions?.length || 0);
      })
      .catch(err => {
        console.error('[Dashboard] Failed to fetch sessions:', err);
        console.error('[Dashboard] Error message:', err.message);
      });
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('[Dashboard] Starting upload:', file.name, file.size, 'bytes');
    setError("");
    setUploading(true);
    
    try {
      console.log('[Dashboard] Calling api.uploadFile...');
      const res = await api.uploadFile(file);
      console.log('[Dashboard] Upload response:', res);
      
      const newSession = { 
        session_id: res.session_id, 
        filename: res.filename, 
        chunk_count: res.chunks, 
        created_at: new Date().toISOString() 
      };
      
      console.log('[Dashboard] Adding to sessions:', newSession);
      setSessions((prev) => [newSession, ...prev]);
      console.log('[Dashboard] Upload successful!');
      alert('✅ Upload successful! File: ' + res.filename);
    } catch (err) {
      console.error('[Dashboard] Upload failed:', err);
      console.error('[Dashboard] Error message:', err.message);
      setError(err.message);
      alert('❌ Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header with Quick Actions */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 mt-1">Your learning hub with all premium features</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/flashcards')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-semibold"
          >
            🎴 Flashcards
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
          >
            📊 Analytics
          </button>
          <button
            onClick={() => navigate('/tutor')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold"
          >
            🧑‍🏫 AI Tutor
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🔍', label: 'Search', path: '/search', color: 'from-gray-500 to-gray-700' },
          { icon: '📋', label: 'Summary', path: '/summary', color: 'from-indigo-500 to-blue-600' },
          { icon: '⏰', label: 'Study Timer', path: '/study-timer', color: 'from-green-500 to-teal-600' },
          { icon: '⭐', label: 'Bookmarks', path: '/bookmarks', color: 'from-yellow-500 to-orange-600' },
        ].map(({ icon, label, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`bg-gradient-to-br ${color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
          >
            <div className="text-4xl mb-2">{icon}</div>
            <div className="font-semibold text-lg">{label}</div>
          </button>
        ))}
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">📚 Your Documents</h3>
        <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
          📊 Total: {sessions.length} documents
        </div>
      </div>

      {/* Debug Box */}
      {sessions.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
          <p className="text-yellow-800 font-semibold mb-2">⚠️ No documents yet</p>
          <p className="text-yellow-700 text-sm">
            Upload a PDF or TXT file using the box below to get started with all features!
          </p>
        </div>
      )}

      {/* Upload zone */}
      <div
        onClick={() => fileRef.current.click()}
        className="border-2 border-dashed border-indigo-300 rounded-2xl p-10 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all mb-8"
      >
        <div className="text-4xl mb-3">📄</div>
        <p className="font-semibold text-gray-700">
          {uploading ? "Uploading & processing..." : "Click to upload a file"}
        </p>
        <p className="text-sm text-gray-400 mt-1">PDF or TXT — max 20MB</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No documents yet — upload one above!</div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.session_id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="font-semibold text-gray-800">📄 {s.filename}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {s.chunk_count} chunks · {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "💬 Chat", path: "chat" },
                  { label: "📝 Notes", path: "notes" },
                  { label: "❓ MCQ", path: "mcq" },
                  { label: "🔍 Explain", path: "explain" },
                ].map(({ label, path }) => (
                  <button
                    key={path}
                    onClick={() => navigate(`/${path}/${s.session_id}`)}
                    className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
