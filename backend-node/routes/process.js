import express from 'express';
import { authenticate } from '../middleware/auth.js';
import llmClient from '../utils/llmClient.js';
import ragClient from '../utils/ragClient.js';
import Session from '../models/Session.js';

const router = express.Router();

/**
 * @route   POST /process/flowchart
 * @desc    Generate Mermaid flowchart from text
 * @access  Private
 */
router.post('/flowchart', authenticate, async (req, res, next) => {
  try {
    const { text, session_id } = req.body;

    let sourceText = text;

    // If session_id provided, use document content
    if (session_id) {
      const session = await Session.findOne({
        session_id,
        user_id: req.user._id
      });

      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found'
        });
      }

      try {
        const chunks = await ragClient.getAllChunks(session_id);
        if (chunks && chunks.length > 0) {
          // Use first few chunks for flowchart
          sourceText = chunks.slice(0, 5).join('\n\n');
        }
      } catch (error) {
        console.error('[FLOWCHART] Failed to retrieve chunks:', error.message);
      }
    }

    // Validation
    if (!sourceText || !sourceText.trim()) {
      return res.status(400).json({ 
        error: 'No text provided',
        detail: 'Please provide text or a valid session_id'
      });
    }

    console.log(`[FLOWCHART] Generating flowchart from text: ${sourceText.substring(0, 50)}...`);

    // Generate flowchart using LLM
    let mermaidCode;
    try {
      mermaidCode = await llmClient.generateFlowchart(sourceText);
    } catch (error) {
      console.error('[FLOWCHART] LLM generation failed:', error.message);
      return res.status(500).json({ 
        error: 'Failed to generate flowchart',
        detail: error.message
      });
    }

    console.log(`[FLOWCHART] Flowchart generated successfully`);

    res.json({
      mermaid: mermaidCode,
      text: sourceText.substring(0, 200) + (sourceText.length > 200 ? '...' : '')
    });
  } catch (error) {
    console.error('[FLOWCHART] Error:', error);
    next(error);
  }
});

/**
 * @route   POST /process/graph
 * @desc    Generate concept graph (knowledge graph)
 * @access  Private
 */
router.post('/graph', authenticate, async (req, res, next) => {
  try {
    const { text, session_id } = req.body;

    let sourceText = text;

    // If session_id provided, use document content
    if (session_id) {
      const session = await Session.findOne({
        session_id,
        user_id: req.user._id
      });

      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found'
        });
      }

      try {
        const chunks = await ragClient.getAllChunks(session_id);
        if (chunks && chunks.length > 0) {
          sourceText = chunks.slice(0, 5).join('\n\n');
        }
      } catch (error) {
        console.error('[GRAPH] Failed to retrieve chunks:', error.message);
      }
    }

    // Validation
    if (!sourceText || !sourceText.trim()) {
      return res.status(400).json({ 
        error: 'No text provided',
        detail: 'Please provide text or a valid session_id'
      });
    }

    console.log(`[GRAPH] Generating concept graph from text: ${sourceText.substring(0, 50)}...`);

    // Generate graph using LLM (similar to flowchart but for concept relationships)
    const prompt = `Extract key concepts and their relationships from this text and create a Mermaid graph diagram showing how concepts connect.\nReturn ONLY valid Mermaid code starting with 'graph TD' or 'graph LR'. No markdown fences.\n\nText:\n${sourceText}`;

    let mermaidCode;
    try {
      mermaidCode = await llmClient.chat([{ role: 'user', content: prompt }], 2048);
      mermaidCode = mermaidCode.trim().replace(/^```mermaid|^```|```$/gm, '').trim();
    } catch (error) {
      console.error('[GRAPH] LLM generation failed:', error.message);
      return res.status(500).json({ 
        error: 'Failed to generate concept graph',
        detail: error.message
      });
    }

    console.log(`[GRAPH] Concept graph generated successfully`);

    res.json({
      mermaid: mermaidCode,
      text: sourceText.substring(0, 200) + (sourceText.length > 200 ? '...' : '')
    });
  } catch (error) {
    console.error('[GRAPH] Error:', error);
    next(error);
  }
});

/**
 * @route   POST /process/summary
 * @desc    Generate summary of text or document
 * @access  Private
 */
router.post('/summary', authenticate, async (req, res, next) => {
  try {
    const { text, session_id, length = 'medium' } = req.body;

    let sourceText = text;

    // If session_id provided, use document content
    if (session_id) {
      const session = await Session.findOne({
        session_id,
        user_id: req.user._id
      });

      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found'
        });
      }

      try {
        const chunks = await ragClient.getAllChunks(session_id);
        if (chunks && chunks.length > 0) {
          sourceText = chunks.join('\n\n');
        }
      } catch (error) {
        console.error('[SUMMARY] Failed to retrieve chunks:', error.message);
      }
    }

    // Validation
    if (!sourceText || !sourceText.trim()) {
      return res.status(400).json({ 
        error: 'No text provided'
      });
    }

    const lengthInstructions = {
      short: 'Write a very brief summary in 2-3 sentences.',
      medium: 'Write a concise summary in one paragraph (5-7 sentences).',
      long: 'Write a comprehensive summary covering all key points in multiple paragraphs.'
    };

    const prompt = `${lengthInstructions[length] || lengthInstructions.medium}\n\nText:\n${sourceText.substring(0, 10000)}`;

    let summary;
    try {
      summary = await llmClient.chat([{ role: 'user', content: prompt }]);
    } catch (error) {
      console.error('[SUMMARY] LLM generation failed:', error.message);
      return res.status(500).json({ 
        error: 'Failed to generate summary',
        detail: error.message
      });
    }

    res.json({
      summary,
      length
    });
  } catch (error) {
    console.error('[SUMMARY] Error:', error);
    next(error);
  }
});

export default router;
