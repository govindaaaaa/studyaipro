import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AnalyticsPage() {
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [overview, setOverview] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [quizData, overviewData, comparisonData] = await Promise.all([
        api.getQuizAnalytics(),
        api.getStudyOverview(),
        api.getPerformanceComparison()
      ]);

      setQuizAnalytics(quizData);
      setOverview(overviewData);
      setComparison(comparisonData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-purple-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">📊 Analytics Dashboard</h1>
          <p className="text-gray-600">Track your learning progress and performance</p>
        </div>

        {/* Overview Cards */}
        {overview && (
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl mb-2">📄</div>
              <div className="text-3xl font-bold text-purple-900">{overview.total_documents}</div>
              <div className="text-gray-600">Documents</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-3xl font-bold text-blue-900">{overview.total_notes}</div>
              <div className="text-gray-600">Notes Created</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-green-900">{overview.total_quizzes}</div>
              <div className="text-gray-600">Quizzes Taken</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-orange-900">{overview.study_days_last_30}</div>
              <div className="text-gray-600">Study Days (30d)</div>
            </div>
          </div>
        )}

        {/* Quiz Performance */}
        {quizAnalytics && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">🎯 Quiz Performance</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 mb-1">Average Score</p>
                  <p className="text-4xl font-bold text-purple-900">
                    {quizAnalytics.summary.average_score}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Pass Rate</p>
                  <p className="text-4xl font-bold text-green-900">
                    {quizAnalytics.summary.pass_rate}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Total Quizzes</p>
                  <p className="text-4xl font-bold text-blue-900">
                    {quizAnalytics.summary.total_quizzes}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-green-800 font-semibold">✅ Passed</p>
                  <p className="text-2xl font-bold text-green-900">
                    {quizAnalytics.summary.passed_quizzes}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">❌ Failed</p>
                  <p className="text-2xl font-bold text-red-900">
                    {quizAnalytics.summary.failed_quizzes}
                  </p>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">📈 Performance by Difficulty</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(quizAnalytics.by_difficulty).map(([level, stats]) => (
                  <div key={level} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-lg mb-3 capitalize">{level}</h3>
                    <p className="text-3xl font-bold text-purple-900 mb-2">
                      {stats.avg_score.toFixed(1)}%
                    </p>
                    <p className="text-gray-600">{stats.count} quizzes</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Scores */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">📋 Recent Scores</h2>
              <div className="space-y-3">
                {quizAnalytics.recent_scores.map((score, idx) => (
                  <div key={score.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        score.score >= 80 ? 'bg-green-500' : 
                        score.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {score.score}%
                      </div>
                      <div>
                        <p className="font-semibold">{score.correct}/{score.questions} correct</p>
                        <p className="text-sm text-gray-500">
                          {new Date(score.date).toLocaleDateString()} • {score.difficulty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Session</p>
                      <p className="text-xs text-gray-400">{score.session_id.substring(0, 8)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week Comparison */}
            {comparison && (
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-6">📅 This Week vs Last Week</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-purple-200 mb-1">This Week</p>
                    <p className="text-4xl font-bold">{comparison.this_week.avg_score}%</p>
                    <p className="text-purple-200">{comparison.this_week.quizzes} quizzes</p>
                  </div>
                  <div>
                    <p className="text-purple-200 mb-1">Last Week</p>
                    <p className="text-4xl font-bold">{comparison.last_week.avg_score}%</p>
                    <p className="text-purple-200">{comparison.last_week.quizzes} quizzes</p>
                  </div>
                </div>
                <div className="mt-6 bg-white/20 p-4 rounded-xl">
                  <p className="text-lg font-semibold">
                    {comparison.trend === 'improving' && '📈 Improving! Keep it up!'}
                    {comparison.trend === 'declining' && '📉 Need more practice'}
                    {comparison.trend === 'stable' && '➡️ Consistent performance'}
                  </p>
                  <p className="text-purple-200">
                    {comparison.improvement > 0 ? '+' : ''}{comparison.improvement}% change
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
