import express from 'express';
import Session from '../models/Session.js';
import Note from '../models/Note.js';
import ChatHistory from '../models/ChatHistory.js';
import Flashcard from '../models/Flashcard.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Global search across all content
router.get('/', authenticate, async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchQuery = q.trim();
    const userId = req.user._id;
    const searchRegex = new RegExp(searchQuery, 'i');

    console.log(`[SEARCH] Query: "${searchQuery}", Type: ${type || 'all'}`);

    const results = {
      query: searchQuery,
      sessions: [],
      notes: [],
      chats: [],
      flashcards: []
    };

    // Search sessions
    if (!type || type === 'sessions') {
      const sessions = await Session.find({
        user_id: userId,
        filename: searchRegex
      })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .select('session_id filename created_at');

      results.sessions = sessions.map(s => ({
        type: 'session',
        id: s.session_id,
        title: s.filename,
        date: s.created_at
      }));
    }

    // Search notes
    if (!type || type === 'notes') {
      const notes = await Note.find({
        user_id: userId,
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .select('title content session_id mode created_at');

      results.notes = notes.map(n => ({
        type: 'note',
        id: n._id,
        title: n.title,
        excerpt: n.content.substring(0, 150) + '...',
        session_id: n.session_id,
        mode: n.mode,
        date: n.created_at
      }));
    }

    // Search chat history
    if (!type || type === 'chats') {
      const chats = await ChatHistory.find({
        user_id: userId,
        $or: [
          { user_message: searchRegex },
          { ai_response: searchRegex }
        ]
      })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .select('user_message ai_response session_id created_at');

      results.chats = chats.map(c => ({
        type: 'chat',
        id: c._id,
        question: c.user_message.substring(0, 100),
        answer: c.ai_response.substring(0, 150) + '...',
        session_id: c.session_id,
        date: c.created_at
      }));
    }

    // Search flashcards
    if (!type || type === 'flashcards') {
      const flashcards = await Flashcard.find({
        user_id: userId,
        $or: [
          { deck_name: searchRegex },
          { 'cards.question': searchRegex },
          { 'cards.answer': searchRegex }
        ]
      })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .select('deck_name cards session_id created_at');

      results.flashcards = flashcards.flatMap(f => {
        const matchingCards = f.cards.filter(card =>
          searchRegex.test(card.question) || searchRegex.test(card.answer)
        );

        return matchingCards.map(card => ({
          type: 'flashcard',
          id: f._id,
          deck_name: f.deck_name,
          question: card.question,
          answer: card.answer.substring(0, 100),
          session_id: f.session_id,
          date: f.created_at
        }));
      }).slice(0, parseInt(limit));
    }

    const totalResults = 
      results.sessions.length +
      results.notes.length +
      results.chats.length +
      results.flashcards.length;

    console.log(`[SEARCH] Found ${totalResults} results`);

    res.json({
      ...results,
      total: totalResults
    });

  } catch (error) {
    console.error('[SEARCH] Failed:', error.message);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Search suggestions (autocomplete)
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchRegex = new RegExp(`^${q}`, 'i');
    
    // Get recent session titles
    const sessions = await Session.find({
      user_id: req.user._id,
      filename: searchRegex
    })
    .limit(5)
    .select('filename')
    .sort({ created_at: -1 });

    // Get note titles
    const notes = await Note.find({
      user_id: req.user._id,
      title: searchRegex
    })
    .limit(5)
    .select('title')
    .sort({ created_at: -1 });

    const suggestions = [
      ...sessions.map(s => s.filename),
      ...notes.map(n => n.title)
    ].slice(0, 8);

    res.json({ suggestions: [...new Set(suggestions)] });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

export default router;
