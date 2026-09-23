import express from 'express';
import axios from 'axios';
import config from '../config/config.js';
import llmClient from '../utils/llmClient.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate quick summary
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { session_id, type = 'tldr', max_length = 500 } = req.body;

    console.log(`[SUMMARY] Generating ${type} summary for session: ${session_id}`);

    // Get chunks from RAG
    const ragResponse = await axios.post(`${config.ragServiceUrl}/retrieve`, {
      session_id,
      query: "Summarize the main points and key information",
      top_k: 15
    });

    const chunks = ragResponse.data.chunks || ragResponse.data.results || [];
    if (chunks.length === 0) {
      return res.status(404).json({ error: 'No content found for this session' });
    }

    // Handle both string arrays and object arrays
    const context = chunks.map(c => typeof c === 'string' ? c : c.text).join('\n\n');

    let prompt = '';
    
    if (type === 'tldr') {
      prompt = `Provide a brief TL;DR summary (${max_length} characters max) of the following content. Focus on the most important points.

Content:
${context}

TL;DR:`;
    } else if (type === 'keypoints') {
      prompt = `Extract the key points from the following content as a bullet list (5-7 points):

Content:
${context}

Key Points:`;
    } else if (type === 'detailed') {
      prompt = `Provide a comprehensive summary of the following content. Include main concepts, important details, and conclusions.

Content:
${context}

Summary:`;
    } else if (type === 'eli5') {
      prompt = `Explain the following content in simple terms (like I'm 5 years old). Make it easy to understand.

Content:
${context}

Simple Explanation:`;
    }

    const summary = await llmClient.generateText(prompt, 1000);

    console.log(`[SUMMARY] Generated ${type} summary: ${summary.length} chars`);
    res.json({
      session_id,
      type,
      summary: summary.trim(),
      chunks_used: chunks.length
    });

  } catch (error) {
    console.error('[SUMMARY] Generation failed:', error.message);
    res.status(500).json({ error: 'Failed to generate summary', details: error.message });
  }
});

// Generate comparison summary (compare 2 documents)
router.post('/compare', authenticate, async (req, res) => {
  try {
    const { session_id_1, session_id_2 } = req.body;

    console.log(`[SUMMARY] Comparing sessions: ${session_id_1} vs ${session_id_2}`);

    const [rag1, rag2] = await Promise.all([
      axios.post(`${config.ragServiceUrl}/retrieve`, {
        session_id: session_id_1,
        query: "Summarize main content",
        top_k: 10
      }),
      axios.post(`${config.ragServiceUrl}/retrieve`, {
        session_id: session_id_2,
        query: "Summarize main content",
        top_k: 10
      })
    ]);

    const content1 = rag1.data.results.map(c => c.text).join('\n');
    const content2 = rag2.data.results.map(c => c.text).join('\n');

    const prompt = `Compare and contrast these two documents. Identify similarities, differences, and unique points in each.

Document 1:
${content1}

Document 2:
${content2}

Comparison:`;

    const comparison = await llmClient.generateText(prompt, 1500);

    res.json({
      session_id_1,
      session_id_2,
      comparison: comparison.trim()
    });

  } catch (error) {
    console.error('[SUMMARY] Comparison failed:', error.message);
    res.status(500).json({ error: 'Failed to compare documents' });
  }
});

export default router;
