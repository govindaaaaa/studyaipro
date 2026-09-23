import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Share session with another user
router.post('/session/:session_id', authenticate, async (req, res) => {
  try {
    const { email, permission = 'view' } = req.body;

    // Check if user exists
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    const session = await Session.findOne({
      session_id: req.params.session_id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found or you do not have permission' });
    }

    // Check if already shared
    const alreadyShared = session.shared_with.find(s => s.user_email === email);
    if (alreadyShared) {
      return res.status(400).json({ error: 'Session already shared with this user' });
    }

    session.shared_with.push({ user_email: email, permission });
    await session.save();

    console.log(`[SHARE] Session ${req.params.session_id} shared with ${email}`);
    res.json({ 
      message: 'Session shared successfully', 
      shared_with: email,
      permission
    });

  } catch (error) {
    console.error('[SHARE] Failed:', error.message);
    res.status(500).json({ error: 'Failed to share session' });
  }
});

// Get sessions shared with me
router.get('/shared-with-me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const sharedSessions = await Session.find({
      'shared_with.user_email': user.email
    })
    .populate('user_id', 'email')
    .sort({ created_at: -1 });

    res.json({ 
      shared_sessions: sharedSessions.map(s => ({
        session_id: s.session_id,
        filename: s.filename,
        owner_email: s.user_id.email,
        created_at: s.created_at,
        my_permission: s.shared_with.find(sw => sw.user_email === user.email)?.permission
      }))
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared sessions' });
  }
});

// Revoke access
router.delete('/session/:session_id/user/:email', authenticate, async (req, res) => {
  try {
    const session = await Session.findOne({
      session_id: req.params.session_id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.shared_with = session.shared_with.filter(
      s => s.user_email !== req.params.email
    );

    await session.save();

    res.json({ message: 'Access revoked' });

  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

export default router;
