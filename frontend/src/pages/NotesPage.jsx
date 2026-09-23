import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

const MODES = ["basic", "detailed", "bullet"];

export default function NotesPage() {
  const { sessionId } = useParams();
  const [mode, setMode] = useState("detailed");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const generate = async () => {
    setError("");
    setLoading(true);
    setNotes("");
    try {
      const res = await api.generateNotes(sessionId, mode);
      setNotes(res.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!emailTo) return;
    setSending(true);
    try {
      await api.sendEmail(null, emailTo, "Your StudyAI Pro Notes", notes);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-700">←</Link>
        <h2 className="text-2xl font-bold text-gray-800">📝 Generate Notes</h2>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Notes Style</p>
        <div className="flex gap-2 mb-4">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating notes..." : "Generate Notes"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Notes output */}
      {notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Generated Notes ({mode})</h3>
            <button
              onClick={async () => {
                try {
                  const blob = await api.generatePDF(null, `Notes - ${mode}`, notes);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `notes-${mode}.pdf`;
                  a.click();
                } catch (err) {
                  setError(err.message);
                }
              }}
              className="text-sm text-indigo-600 hover:underline"
            >
              ⬇ Download PDF
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{notes}</pre>

          {/* Email share */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">📧 Email these notes</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="recipient@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleEmail}
                disabled={sending || !emailTo}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {sent ? "✓ Sent!" : sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
