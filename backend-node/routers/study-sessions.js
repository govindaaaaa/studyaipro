import express from 'express';
import StudySession from '../models/StudySession.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Start study session
router.post('/start', authenticate, async (req, res) => {
  try {
    const { session_type, document_id, notes } = req.body;

    const studySession = new StudySession({
      user_id: req.user._id,
      session_type: session_type || 'study',
      document_id,
      start_time: new Date(),
      notes,
      completed: false
    });

    await studySession.save();

    console.log(`[STUDY] Session started: ${studySession._id}`);
    res.json({ 
      message: 'Study session started', 
      session_id: studySession._id,
      start_time: studySession.start_time 
    });

  } catch (error) {
    console.error('[STUDY] Start failed:', error.message);
    res.status(500).json({ error: 'Failed to start study session' });
  }
});

// End study session
router.patch('/:id/end', authenticate, async (req, res) => {
  try {
    const { productivity_rating, notes } = req.body;

    const studySession = await StudySession.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!studySession) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    studySession.end_time = new Date();
    studySession.completed = true;
    studySession.duration_minutes = Math.round(
      (studySession.end_time - studySession.start_time) / (1000 * 60)
    );
    
    if (productivity_rating) studySession.productivity_rating = productivity_rating;
    if (notes) studySession.notes = notes;

    await studySession.save();

    console.log(`[STUDY] Session ended: ${studySession._id}, duration: ${studySession.duration_minutes}min`);
    res.json({ 
      message: 'Study session ended', 
      duration_minutes: studySession.duration_minutes,
      session: studySession
    });

  } catch (error) {
    console.error('[STUDY] End failed:', error.message);
    res.status(500).json({ error: 'Failed to end study session' });
  }
});

// Add break
router.patch('/:id/break', authenticate, async (req, res) => {
  try {
    const studySession = await StudySession.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { $inc: { breaks_taken: 1 } },
      { new: true }
    );

    if (!studySession) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    res.json({ message: 'Break recorded', breaks: studySession.breaks_taken });

  } catch (error) {
    res.status(500).json({ error: 'Failed to record break' });
  }
});

// Log activity
router.patch('/:id/activity', authenticate, async (req, res) => {
  try {
    const { type, duration_seconds } = req.body;

    const studySession = await StudySession.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!studySession) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    studySession.activities.push({
      type,
      timestamp: new Date(),
      duration_seconds
    });

    await studySession.save();

    res.json({ message: 'Activity logged' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Get study statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const sessions = await StudySession.find({
      user_id: req.user._id,
      created_at: { $gte: daysAgo }
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const avgSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    const completedSessions = sessions.filter(s => s.completed).length;
    const totalBreaks = sessions.reduce((sum, s) => sum + (s.breaks_taken || 0), 0);

    // Productivity rating average
    const ratedSessions = sessions.filter(s => s.productivity_rating);
    const avgProductivity = ratedSessions.length > 0
      ? ratedSessions.reduce((sum, s) => sum + s.productivity_rating, 0) / ratedSessions.length
      : 0;

    // Daily breakdown
    const dailyMap = {};
    sessions.forEach(s => {
      const date = new Date(s.start_time).toDateString();
      if (!dailyMap[date]) {
        dailyMap[date] = { sessions: 0, minutes: 0 };
      }
      dailyMap[date].sessions += 1;
      dailyMap[date].minutes += s.duration_minutes || 0;
    });

    const dailyStats = Object.keys(dailyMap).map(date => ({
      date,
      sessions: dailyMap[date].sessions,
      minutes: dailyMap[date].minutes
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      summary: {
        total_sessions: totalSessions,
        total_minutes: totalMinutes,
        total_hours: Math.round(totalMinutes / 60 * 10) / 10,
        avg_session_length: avgSessionLength,
        completed_sessions: completedSessions,
        total_breaks: totalBreaks,
        avg_productivity: Math.round(avgProductivity * 10) / 10
      },
      daily_stats: dailyStats,
      recent_sessions: sessions.slice(0, 10).map(s => ({
        id: s._id,
        type: s.session_type,
        start: s.start_time,
        end: s.end_time,
        duration: s.duration_minutes,
        completed: s.completed
      }))
    });

  } catch (error) {
    console.error('[STUDY] Stats failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch study statistics' });
  }
});

// Get active session
router.get('/active', authenticate, async (req, res) => {
  try {
    const activeSession = await StudySession.findOne({
      user_id: req.user._id,
      completed: false
    }).sort({ start_time: -1 });

    if (!activeSession) {
      return res.json({ active: false });
    }

    const elapsed = Math.round((Date.now() - activeSession.start_time) / (1000 * 60));

    res.json({
      active: true,
      session: activeSession,
      elapsed_minutes: elapsed
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
});

export default router;
