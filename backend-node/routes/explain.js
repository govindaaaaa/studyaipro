import express from 'express';
import { authenticate } from '../middleware/auth.js';
import llmClient from '../utils/llmClient.js';

const router = express.Router();

/**
 * @route   POST /explain
 * @desc    Get explanation for a topic or text
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { text, mode = 'Student' } = req.body;

    // Validation
    if (!text) {
      return res.status(400).json({ 
        error: 'Missing required field',
        detail: 'Please provide text to explain'
      });
    }

    if (!text.trim()) {
      return res.status(400).json({ 
        error: 'Text cannot be empty'
      });
    }

    if (!['ELI5', 'Student', 'Expert'].includes(mode)) {
      return res.status(400).json({ 
        error: 'Invalid mode',
        detail: 'Mode must be one of: ELI5, Student, Expert'
      });
    }

    console.log(`[EXPLAIN] Generating ${mode} explanation for text: ${text.substring(0, 50)}...`);

    // Generate explanation using LLM
    let explanation;
    try {
      explanation = await llmClient.generateExplanation(text, mode);
    } catch (error) {
      console.error('[EXPLAIN] LLM generation failed:', error.message);
      return res.status(500).json({ 
        error: 'Failed to generate explanation',
        detail: error.message
      });
    }

    console.log(`[EXPLAIN] Explanation generated successfully`);

    res.json({
      text,
      mode,
      explanation
    });
  } catch (error) {
    console.error('[EXPLAIN] Error:', error);
    next(error);
  }
});

/**
 * @route   POST /explain/batch
 * @desc    Get explanations in multiple modes
 * @access  Private
 */
router.post('/batch', authenticate, async (req, res, next) => {
  try {
    const { text, modes = ['ELI5', 'Student', 'Expert'] } = req.body;

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Text is required'
      });
    }

    const validModes = ['ELI5', 'Student', 'Expert'];
    const requestedModes = Array.isArray(modes) ? modes : [modes];
    const invalidModes = requestedModes.filter(m => !validModes.includes(m));

    if (invalidModes.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid modes',
        detail: `Invalid modes: ${invalidModes.join(', ')}`
      });
    }

    console.log(`[EXPLAIN] Generating batch explanations for ${requestedModes.length} modes`);

    // Generate explanations for each mode
    const explanations = {};
    
    for (const mode of requestedModes) {
      try {
        explanations[mode] = await llmClient.generateExplanation(text, mode);
      } catch (error) {
        console.error(`[EXPLAIN] Failed to generate ${mode} explanation:`, error.message);
        explanations[mode] = { error: 'Failed to generate explanation' };
      }
    }

    res.json({
      text,
      explanations
    });
  } catch (error) {
    console.error('[EXPLAIN] Error:', error);
    next(error);
  }
});

export default router;
