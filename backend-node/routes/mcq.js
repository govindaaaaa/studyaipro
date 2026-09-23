import express from 'express';
import { authenticate } from '../middleware/auth.js';
import ragClient from '../utils/ragClient.js';
import llmClient from '../utils/llmClient.js';
import MCQScore from '../models/MCQScore.js';
import Session from '../models/Session.js';

const router = express.Router();

/**
 * @route   POST /mcq/generate
 * @desc    Generate MCQ questions from document
 * @access  Private
 */
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { session_id, difficulty = 'medium', count = 10 } = req.body;

    // Validation
    if (!session_id) {
      return res.status(400).json({ 
        error: 'Missing required field',
        detail: 'Please provide session_id'
      });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ 
        error: 'Invalid difficulty',
        detail: 'Difficulty must be one of: easy, medium, hard'
      });
    }

    const questionCount = parseInt(count);
    if (questionCount < 1 || questionCount > 20) {
      return res.status(400).json({ 
        error: 'Invalid count',
        detail: 'Count must be between 1 and 20'
      });
    }

    // Verify session belongs to user
    const session = await Session.findOne({
      session_id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found'
      });
    }

    console.log(`[MCQ] Generating ${questionCount} ${difficulty} questions for session: ${session_id}`);

    // Get all chunks from RAG service
    let chunks;
    try {
      chunks = await ragClient.getAllChunks(session_id);
    } catch (error) {
      console.error('[MCQ] Failed to retrieve chunks:', error.message);
      return res.status(500).json({ 
        error: 'Failed to retrieve document content'
      });
    }

    if (!chunks || chunks.length === 0) {
      return res.status(400).json({ 
        error: 'No content found'
      });
    }

    // Generate MCQ using LLM
    let questions;
    try {
      questions = await llmClient.generateMCQ(chunks, difficulty, questionCount);
    } catch (error) {
      console.error('[MCQ] LLM generation failed:', error.message);
      return res.status(500).json({ 
        error: 'Failed to generate questions',
        detail: error.message
      });
    }

    console.log(`[MCQ] Generated ${questions.length} questions`);

    res.json({
      session_id,
      difficulty,
      questions,
      count: questions.length
    });
  } catch (error) {
    console.error('[MCQ] Error:', error);
    next(error);
  }
});

/**
 * @route   POST /mcq/submit
 * @desc    Submit MCQ answers and get score
 * @access  Private
 */
router.post('/submit', authenticate, async (req, res, next) => {
  try {
    const { session_id, difficulty, answers, time_taken_seconds = 0 } = req.body;

    // Validation
    if (!session_id || !difficulty || !answers) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        detail: 'Please provide session_id, difficulty, and answers'
      });
    }

    if (typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return res.status(400).json({ 
        error: 'Invalid answers format',
        detail: 'Answers must be an object with question IDs as keys'
      });
    }

    // Verify session belongs to user
    const session = await Session.findOne({
      session_id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found'
      });
    }

    // For now, we'll accept the client's calculation
    // In a real app, you'd regenerate questions server-side and validate
    const totalQuestions = Object.keys(answers).length;
    
    // Calculate score (this is simplified - in production, validate against stored questions)
    let correctAnswers = 0;
    
    // Note: In production, you should store the generated questions and validate against them
    // For this implementation, we trust the client to send correct/incorrect count
    // Or you could regenerate and compare, but that's expensive

    const score = new MCQScore({
      user_id: req.user._id,
      session_id,
      difficulty,
      total_questions: totalQuestions,
      correct_answers: req.body.correct_answers || 0, // Client should send this
      score_percentage: 0, // Will be calculated by pre-save hook
      time_taken_seconds: parseInt(time_taken_seconds),
      answers: new Map(Object.entries(answers))
    });

    await score.save();

    console.log(`[MCQ] Score saved: ${score.score_percentage}% (${score.correct_answers}/${totalQuestions})`);

    res.json({
      score_id: score._id,
      session_id,
      difficulty,
      total_questions: totalQuestions,
      correct_answers: score.correct_answers,
      score_percentage: score.score_percentage,
      time_taken_seconds: score.time_taken_seconds,
      passed: score.score_percentage >= 60,
      created_at: score.created_at.toISOString()
    });
  } catch (error) {
    console.error('[MCQ] Error:', error);
    next(error);
  }
});

/**
 * @route   GET /mcq/scores
 * @desc    Get MCQ score history for user
 * @access  Private
 */
router.get('/scores', authenticate, async (req, res, next) => {
  try {
    const { limit = 20, session_id } = req.query;

    const query = { user_id: req.user._id };
    if (session_id) {
      query.session_id = session_id;
    }

    const scores = await MCQScore.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get session details
    const sessionIds = [...new Set(scores.map(s => s.session_id))];
    const sessions = await Session.find({
      session_id: { $in: sessionIds }
    }).lean();

    const sessionMap = new Map(
      sessions.map(s => [s.session_id, s.filename])
    );

    const result = scores.map(score => ({
      score_id: score._id,
      session_id: score.session_id,
      filename: sessionMap.get(score.session_id) || 'Unknown',
      difficulty: score.difficulty,
      total_questions: score.total_questions,
      correct_answers: score.correct_answers,
      score_percentage: score.score_percentage,
      time_taken_seconds: score.time_taken_seconds,
      passed: score.score_percentage >= 60,
      created_at: score.created_at.toISOString()
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /mcq/scores/:scoreId
 * @desc    Get specific MCQ score details
 * @access  Private
 */
router.get('/scores/:scoreId', authenticate, async (req, res, next) => {
  try {
    const { scoreId } = req.params;

    const score = await MCQScore.findOne({
      _id: scoreId,
      user_id: req.user._id
    }).lean();

    if (!score) {
      return res.status(404).json({ 
        error: 'Score not found'
      });
    }

    // Get session details
    const session = await Session.findOne({
      session_id: score.session_id
    }).lean();

    // Convert Map to object for JSON response
    const answersObj = Object.fromEntries(score.answers);

    res.json({
      score_id: score._id,
      session_id: score.session_id,
      filename: session?.filename || 'Unknown',
      difficulty: score.difficulty,
      total_questions: score.total_questions,
      correct_answers: score.correct_answers,
      score_percentage: score.score_percentage,
      time_taken_seconds: score.time_taken_seconds,
      answers: answersObj,
      passed: score.score_percentage >= 60,
      created_at: score.created_at.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /mcq/stats
 * @desc    Get MCQ statistics for user
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const scores = await MCQScore.find({
      user_id: req.user._id
    }).lean();

    if (scores.length === 0) {
      return res.json({
        total_attempts: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        total_questions_answered: 0,
        pass_rate: 0
      });
    }

    const totalAttempts = scores.length;
    const averageScore = scores.reduce((sum, s) => sum + s.score_percentage, 0) / totalAttempts;
    const highestScore = Math.max(...scores.map(s => s.score_percentage));
    const lowestScore = Math.min(...scores.map(s => s.score_percentage));
    const totalQuestions = scores.reduce((sum, s) => sum + s.total_questions, 0);
    const passed = scores.filter(s => s.score_percentage >= 60).length;
    const passRate = (passed / totalAttempts) * 100;

    res.json({
      total_attempts: totalAttempts,
      average_score: Math.round(averageScore * 10) / 10,
      highest_score: highestScore,
      lowest_score: lowestScore,
      total_questions_answered: totalQuestions,
      pass_rate: Math.round(passRate * 10) / 10,
      passed_attempts: passed
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /mcq/scores/:scoreId
 * @desc    Delete an MCQ score
 * @access  Private
 */
router.delete('/scores/:scoreId', authenticate, async (req, res, next) => {
  try {
    const { scoreId } = req.params;

    const score = await MCQScore.findOneAndDelete({
      _id: scoreId,
      user_id: req.user._id
    });

    if (!score) {
      return res.status(404).json({ 
        error: 'Score not found'
      });
    }

    console.log(`[MCQ] Score deleted: ${scoreId}`);

    res.json({
      message: 'Score deleted successfully',
      score_id: scoreId
    });
  } catch (error) {
    next(error);
  }
});

export default router;
