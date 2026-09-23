import express from 'express';
import Bookmark from '../models/Bookmark.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create bookmark
router.post('/', authenticate, async (req, res) => {
  try {
    const { item_type, item_id, session_id, title, description, tags, folder } = req.body;

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      user_id: req.user._id,
      item_type,
      item_id
    });

    if (existing) {
      return res.status(400).json({ error: 'Item already bookmarked' });
    }

    const bookmark = new Bookmark({
      user_id: req.user._id,
      item_type,
      item_id,
      session_id,
      title,
      description,
      tags: tags || [],
      folder: folder || 'General'
    });

    await bookmark.save();

    console.log(`[BOOKMARKS] Created: ${item_type} - ${title}`);
    res.json({ message: 'Bookmark created', bookmark });

  } catch (error) {
    console.error('[BOOKMARKS] Creation failed:', error.message);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

// Get all bookmarks
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, folder, tag } = req.query;

    const query = { user_id: req.user._id };
    if (type) query.item_type = type;
    if (folder) query.folder = folder;
    if (tag) query.tags = tag;

    const bookmarks = await Bookmark.find(query)
      .sort({ created_at: -1 })
      .limit(100);

    res.json({ bookmarks });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Get folders list
router.get('/folders', authenticate, async (req, res) => {
  try {
    const folders = await Bookmark.distinct('folder', { user_id: req.user._id });
    res.json({ folders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Delete bookmark
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Bookmark.deleteOne({ _id: req.params.id, user_id: req.user._id });
    res.json({ message: 'Bookmark deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// Update bookmark
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, tags, folder } = req.body;
    
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { $set: { title, description, tags, folder } },
      { new: true }
    );

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark updated', bookmark });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

export default router;
