import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

const MODES = ["ELI5", "Student", "Expert"];

export default function ExplainPage() {
  const { sessionId } = useParams();
  const [text, setText] = useState("");
  const [mode, setMode] = useState("Student");
  const [result, setResult] = useState("");
  const [mermaid, setMermaid] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("explain"); // explain | flowchart | graph

  const explain = async () => {
    setError("");
    setLoading(true);
    setResult("");
    try {
      const res = await api.explain(text, mode);
      setResult(res.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateDiagram = async (type) => {
    setError("");
    setLoadingFlow(true);
    setMermaid("");
    try {
      const res = type === "flowchart" 
        ? await api.generateFlowchart(text) 
        : await api.generateConceptGraph(text);
      setMermaid(res.mermaid);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFlow(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-700">←</Link>
        <h2 className="text-2xl font-bold text-gray-800">🔍 Explain & Visualize</h2>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {["explain", "flowchart", "graph"].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); setMermaid(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {t === "explain" ? "🔍 Explain" : t === "flowchart" ? "📊 Flowchart" : "🕸 Concept Graph"}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a concept, paragraph, or topic from your document..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        {tab === "explain" && (
          <div className="flex gap-2 mt-3 mb-3">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === m ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() =>
            tab === "explain" ? explain() : generateDiagram(tab)
          }
          disabled={!text.trim() || loading || loadingFlow}
          className="w-full mt-2 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading || loadingFlow ? "Processing..." : tab === "explain" ? `Explain (${mode})` : `Generate ${tab}`}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Explanation output */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Explanation ({mode})</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</p>
        </div>
      )}

      {/* Mermaid output */}
      {mermaid && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            {tab === "flowchart" ? "Flowchart" : "Concept Graph"} — Mermaid Code
          </h3>
          <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {mermaid}
          </pre>
          <p className="text-xs text-gray-400 mt-3">
            📌 Paste this into{" "}
            <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
              mermaid.live
            </a>{" "}
            to render the diagram.
          </p>
        </div>
      )}
    </div>
  );
}
