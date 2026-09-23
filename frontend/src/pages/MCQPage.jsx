import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function MCQPage() {
  const { sessionId } = useParams();
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setError("");
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    try {
      const res = await api.generateMCQ(sessionId, difficulty, count);
      setQuestions(res.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      // Calculate correct answers
      let correctCount = 0;
      const results = questions.map((q) => {
        const chosen = answers[q.id];
        const isCorrect = chosen === q.answer;
        if (isCorrect) correctCount++;
        return {
          question: q.question,
          chosen,
          correct_answer: q.answer,
          is_correct: isCorrect,
          explanation: q.explanation
        };
      });
      
      const res = await api.submitMCQ(sessionId, difficulty, answers, correctCount);
      setResult({
        score: correctCount,
        total: questions.length,
        score_pct: res.score_percentage,
        results
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-700">←</Link>
        <h2 className="text-2xl font-bold text-gray-800">❓ MCQ Quiz</h2>
      </div>

      {/* Controls */}
      {!questions.length && !result && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    difficulty === d ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Number of questions: {count}</p>
            <input
              type="range"
              min={5}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Generating quiz..." : "Generate Quiz"}
          </button>
        </div>
      )}

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-indigo-600">{result.score_pct}%</div>
            <p className="text-gray-500 mt-1">{result.score}/{result.total} correct</p>
          </div>
          {result.results.map((r, i) => (
            <div key={i} className={`mb-4 p-4 rounded-lg ${r.is_correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <p className="text-sm font-medium text-gray-800 mb-1">Q{i + 1}: {r.question}</p>
              <p className="text-sm text-gray-600">Your answer: <span className="font-medium">{r.chosen || "—"}</span></p>
              {!r.is_correct && <p className="text-sm text-gray-600">Correct: <span className="font-medium text-green-700">{r.correct_answer}</span></p>}
              {r.explanation && <p className="text-xs text-gray-500 mt-1 italic">{r.explanation}</p>}
            </div>
          ))}
          <button
            onClick={() => { setQuestions([]); setResult(null); setAnswers({}); }}
            className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && !result && (
        <div className="space-y-5">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="font-medium text-gray-800 mb-3">Q{i + 1}: {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const letter = opt[0];
                  const selected = answers[q.id] === letter;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, [q.id]: letter })}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                        selected
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            onClick={submit}
            disabled={!allAnswered || submitting}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : `Submit Quiz (${Object.keys(answers).length}/${questions.length} answered)`}
          </button>
        </div>
      )}
    </div>
  );
}
