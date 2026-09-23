import express from 'express';
import Session from '../models/Session.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Add tags to session
router.patch('/session/:session_id', authenticate, async (req, res) => {
  try {
    const { tags, category } = req.body;

    const session = await Session.findOne({
      session_id: req.params.session_id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (tags) session.tags = tags;
    if (category) session.category = category;

    await session.save();

    res.json({ message: 'Tags updated', tags: session.tags, category: session.category });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update tags' });
  }
});

// Get all tags
router.get('/list', authenticate, async (req, res) => {
  try {
    const tags = await Session.distinct('tags', { user_id: req.user._id });
    const categories = await Session.distinct('category', { user_id: req.user._id });

    res.json({ tags: tags.filter(Boolean), categories: categories.filter(Boolean) });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get sessions by tag
router.get('/:tag', authenticate, async (req, res) => {
  try {
    const sessions = await Session.find({
      user_id: req.user._id,
      tags: req.params.tag
    })
    .sort({ created_at: -1 })
    .limit(50);

    res.json({ tag: req.params.tag, sessions });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions by tag' });
  }
});

export default router;
