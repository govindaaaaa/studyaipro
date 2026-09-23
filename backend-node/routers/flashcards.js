import express from 'express';
import Flashcard from '../models/Flashcard.js';
import Session from '../models/Session.js';
import { authenticate } from '../middleware/auth.js';
import llmClient from '../utils/llmClient.js';
import axios from 'axios';
import config from '../config/config.js';

const router = express.Router();

// Generate flashcards from session
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { session_id, count = 10, difficulty = 'medium' } = req.body;

    console.log(`[FLASHCARDS] Generating ${count} flashcards for session: ${session_id}`);

    // Get chunks from RAG service
    const ragResponse = await axios.post(`${config.ragServiceUrl}/retrieve`, {
      session_id,
      query: "Generate comprehensive study flashcards",
      top_k: 15
    });

    const chunks = ragResponse.data.chunks || ragResponse.data.results || [];
    if (chunks.length === 0) {
      return res.status(404).json({ error: 'No content found for this session' });
    }

    console.log(`[FLASHCARDS] Retrieved ${chunks.length} chunks`);

    // Handle both string arrays and object arrays
    const context = chunks.map(c => typeof c === 'string' ? c : c.text).join('\n\n');

    const prompt = `Based on the following content, create ${count} high-quality flashcards for studying.

Content:
${context}

Generate exactly ${count} flashcards in JSON format. Each flashcard should have a question and answer.
Format as JSON array: [{"question": "Q1", "answer": "A1"}, {"question": "Q2", "answer": "A2"}, ...]

Make questions clear, specific, and test understanding. Answers should be concise but complete.
Difficulty level: ${difficulty}

Return ONLY the JSON array, no other text.`;

    const response = await llmClient.generateText(prompt, 2000);
    
    // Parse JSON from response
    let cards = [];
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cards = JSON.parse(jsonMatch[0]);
      } else {
        cards = JSON.parse(response);
      }
    } catch (parseError) {
      console.error('[FLASHCARDS] Failed to parse JSON, creating manual cards');
      // Fallback: create simple cards from chunks
      cards = chunks.slice(0, count).map((chunk, idx) => {
        const text = typeof chunk === 'string' ? chunk : chunk.text;
        return {
          question: `Question ${idx + 1} about: ${text.substring(0, 100)}...`,
          answer: text.substring(0, 300)
        };
      });
    }

    // Save to database
    const flashcardDoc = new Flashcard({
      user_id: req.user._id,
      session_id,
      deck_name: `Study Deck - ${new Date().toLocaleDateString()}`,
      cards: cards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty,
        confidence: 0,
        times_reviewed: 0
      }))
    });

    await flashcardDoc.save();

    console.log(`[FLASHCARDS] Generated ${cards.length} flashcards`);
    res.json({
      flashcard_id: flashcardDoc._id,
      session_id,
      deck_name: flashcardDoc.deck_name,
      cards: flashcardDoc.cards,
      count: cards.length
    });

  } catch (error) {
    console.error('[FLASHCARDS] Generation failed:', error.message);
    res.status(500).json({ error: 'Failed to generate flashcards', details: error.message });
  }
});

// Get all flashcards for user
router.get('/', authenticate, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .limit(50);

    res.json({ flashcards });
  } catch (error) {
    console.error('[FLASHCARDS] Fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get flashcards by session
router.get('/session/:session_id', authenticate, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      user_id: req.user._id,
      session_id: req.params.session_id
    }).sort({ created_at: -1 });

    res.json({ flashcards });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Update card review (spaced repetition)
router.patch('/:id/review/:card_index', authenticate, async (req, res) => {
  try {
    const { id, card_index } = req.params;
    const { confidence } = req.body; // 1-5 rating

    const flashcard = await Flashcard.findOne({ _id: id, user_id: req.user._id });
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard deck not found' });
    }

    const cardIdx = parseInt(card_index);
    if (cardIdx < 0 || cardIdx >= flashcard.cards.length) {
      return res.status(400).json({ error: 'Invalid card index' });
    }

    const card = flashcard.cards[cardIdx];
    card.times_reviewed += 1;
    card.last_reviewed = new Date();
    card.confidence = confidence || card.confidence;

    // Spaced repetition: next review based on confidence
    const daysUntilReview = confidence >= 4 ? 7 : confidence >= 3 ? 3 : 1;
    card.next_review = new Date(Date.now() + daysUntilReview * 24 * 60 * 60 * 1000);

    await flashcard.save();

    res.json({ 
      message: 'Card reviewed', 
      card,
      next_review_in_days: daysUntilReview 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update card review' });
  }
});

// Delete flashcard deck
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Flashcard.deleteOne({ _id: req.params.id, user_id: req.user._id });
    res.json({ message: 'Flashcard deck deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete flashcard deck' });
  }
});

export default router;
