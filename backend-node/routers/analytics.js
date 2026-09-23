import express from 'express';
import MCQScore from '../models/MCQScore.js';
import Session from '../models/Session.js';
import Note from '../models/Note.js';
import Flashcard from '../models/Flashcard.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get quiz analytics
router.get('/quiz', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all scores
    const scores = await MCQScore.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(50);

    // Calculate statistics
    const totalQuizzes = scores.length;
    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score_percentage, 0) / scores.length
      : 0;

    const passedQuizzes = scores.filter(s => s.score_percentage >= 60).length;
    const passRate = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) * 100 : 0;

    // Performance by difficulty
    const byDifficulty = {
      easy: scores.filter(s => s.difficulty === 'easy'),
      medium: scores.filter(s => s.difficulty === 'medium'),
      hard: scores.filter(s => s.difficulty === 'hard')
    };

    const difficultyStats = {
      easy: {
        count: byDifficulty.easy.length,
        avg_score: byDifficulty.easy.length > 0
          ? byDifficulty.easy.reduce((sum, s) => sum + s.score_percentage, 0) / byDifficulty.easy.length
          : 0
      },
      medium: {
        count: byDifficulty.medium.length,
        avg_score: byDifficulty.medium.length > 0
          ? byDifficulty.medium.reduce((sum, s) => sum + s.score_percentage, 0) / byDifficulty.medium.length
          : 0
      },
      hard: {
        count: byDifficulty.hard.length,
        avg_score: byDifficulty.hard.length > 0
          ? byDifficulty.hard.reduce((sum, s) => sum + s.score_percentage, 0) / byDifficulty.hard.length
          : 0
      }
    };

    // Performance over time (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentScores = scores.filter(s => new Date(s.created_at) >= sevenDaysAgo);

    // Topics performance
    const topicsMap = {};
    scores.forEach(score => {
      if (score.topics_covered && score.topics_covered.length > 0) {
        score.topics_covered.forEach(topic => {
          if (!topicsMap[topic]) {
            topicsMap[topic] = { count: 0, total_score: 0 };
          }
          topicsMap[topic].count += 1;
          topicsMap[topic].total_score += score.score_percentage;
        });
      }
    });

    const topicStats = Object.keys(topicsMap).map(topic => ({
      topic,
      quizzes_taken: topicsMap[topic].count,
      avg_score: Math.round(topicsMap[topic].total_score / topicsMap[topic].count)
    })).sort((a, b) => b.quizzes_taken - a.quizzes_taken);

    res.json({
      summary: {
        total_quizzes: totalQuizzes,
        average_score: Math.round(avgScore * 10) / 10,
        pass_rate: Math.round(passRate * 10) / 10,
        passed_quizzes: passedQuizzes,
        failed_quizzes: totalQuizzes - passedQuizzes
      },
      by_difficulty: difficultyStats,
      recent_performance: recentScores.map(s => ({
        date: s.created_at,
        score: s.score_percentage,
        difficulty: s.difficulty,
        questions: s.total_questions
      })),
      topic_performance: topicStats.slice(0, 10),
      recent_scores: scores.slice(0, 10).map(s => ({
        id: s._id,
        session_id: s.session_id,
        score: s.score_percentage,
        difficulty: s.difficulty,
        questions: s.total_questions,
        correct: s.correct_answers,
        date: s.created_at
      }))
    });

  } catch (error) {
    console.error('[ANALYTICS] Quiz analytics failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch quiz analytics' });
  }
});

// Get overall study statistics
router.get('/overview', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const [sessions, notes, scores, flashcards] = await Promise.all([
      Session.countDocuments({ user_id: userId }),
      Note.countDocuments({ user_id: userId }),
      MCQScore.countDocuments({ user_id: userId }),
      Flashcard.countDocuments({ user_id: userId })
    ]);

    // Get recent activity
    const recentSessions = await Session.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(5)
      .select('filename created_at');

    // Study streak (days with activity)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivity = await Session.find({
      user_id: userId,
      created_at: { $gte: thirtyDaysAgo }
    }).select('created_at');

    const activityDates = new Set(
      recentActivity.map(s => new Date(s.created_at).toDateString())
    );

    res.json({
      total_documents: sessions,
      total_notes: notes,
      total_quizzes: scores,
      total_flashcards: flashcards,
      study_days_last_30: activityDates.size,
      recent_sessions: recentSessions
    });

  } catch (error) {
    console.error('[ANALYTICS] Overview failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// Get performance comparison
router.get('/compare', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get scores from this week and last week
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [thisWeek, lastWeek] = await Promise.all([
      MCQScore.find({ user_id: userId, created_at: { $gte: thisWeekStart } }),
      MCQScore.find({ 
        user_id: userId, 
        created_at: { $gte: lastWeekStart, $lt: thisWeekStart } 
      })
    ]);

    const calcAvg = (scores) => scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score_percentage, 0) / scores.length
      : 0;

    const thisWeekAvg = calcAvg(thisWeek);
    const lastWeekAvg = calcAvg(lastWeek);
    const improvement = thisWeekAvg - lastWeekAvg;

    res.json({
      this_week: {
        quizzes: thisWeek.length,
        avg_score: Math.round(thisWeekAvg * 10) / 10
      },
      last_week: {
        quizzes: lastWeek.length,
        avg_score: Math.round(lastWeekAvg * 10) / 10
      },
      improvement: Math.round(improvement * 10) / 10,
      trend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable'
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

export default router;
