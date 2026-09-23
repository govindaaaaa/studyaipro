import express from 'express';
import axios from 'axios';
import config from '../config/config.js';
import llmClient from '../utils/llmClient.js';
import ChatHistory from '../models/ChatHistory.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// AI Tutor - Interactive learning with follow-up questions
router.post('/teach', authenticate, async (req, res) => {
  try {
    const { session_id, topic, depth = 'moderate' } = req.body;

    console.log(`[TUTOR] Teaching topic: ${topic} for session: ${session_id}`);

    // Get relevant content
    const ragResponse = await axios.post(`${config.ragServiceUrl}/retrieve`, {
      session_id,
      query: topic,
      top_k: 10
    });

    const chunks = ragResponse.data.chunks || ragResponse.data.results || [];
    if (chunks.length === 0) {
      return res.status(404).json({ error: 'No content found for this session' });
    }

    const context = chunks.map(c => c.text).join('\n\n');

    const depthPrompts = {
      simple: 'Explain in very simple terms, as if teaching a beginner.',
      moderate: 'Explain clearly with examples, suitable for a student learning the topic.',
      deep: 'Provide a comprehensive explanation with details, examples, and deeper insights.'
    };

    const prompt = `You are an AI tutor. Teach the following topic based on the content provided. ${depthPrompts[depth]}

Topic: ${topic}

Content:
${context}

Provide:
1. Clear explanation of the topic
2. Key concepts to understand
3. Practical examples
4. 3 comprehension questions the student should be able to answer

Explanation:`;

    const teaching = await llmClient.generateText(prompt, 1500);

    // Save to chat history
    await ChatHistory.create({
      user_id: req.user._id,
      session_id,
      user_message: `Teach me about: ${topic}`,
      ai_response: teaching,
      context_used: chunks.slice(0, 5).map(c => c.text)
    });

    console.log(`[TUTOR] Teaching completed for: ${topic}`);
    res.json({
      session_id,
      topic,
      teaching: teaching.trim(),
      depth
    });

  } catch (error) {
    console.error('[TUTOR] Teaching failed:', error.message);
    res.status(500).json({ error: 'AI tutor failed', details: error.message });
  }
});

// Check understanding - Quiz student on comprehension
router.post('/quiz-me', authenticate, async (req, res) => {
  try {
    const { session_id, topic } = req.body;

    console.log(`[TUTOR] Creating comprehension quiz for: ${topic}`);

    const ragResponse = await axios.post(`${config.ragServiceUrl}/retrieve`, {
      session_id,
      query: topic || "all content",
      top_k: 10
    });

    const chunks = ragResponse.data.chunks || ragResponse.data.results || [];
    // Handle both string arrays and object arrays
    const context = chunks.map(c => typeof c === 'string' ? c : c.text).join('\n\n');

    const prompt = `Based on this content, create 5 thought-provoking questions to test student understanding. Include a mix of recall, application, and analysis questions.

Content:
${context}

Format each question with:
Q: [question]
Type: [recall/application/analysis]
Hint: [helpful hint]

Questions:`;

    const questions = await llmClient.generateText(prompt, 1000);

    res.json({
      session_id,
      questions: questions.trim()
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to create comprehension quiz' });
  }
});

// Explain like I'm 5 (ELI5)
router.post('/eli5', authenticate, async (req, res) => {
  try {
    const { session_id, concept } = req.body;

    console.log(`[TUTOR] ELI5 for: ${concept}`);

    const ragResponse = await axios.post(`${config.ragServiceUrl}/retrieve`, {
      session_id,
      query: concept,
      top_k: 5
    });

    const chunks = ragResponse.data.chunks || ragResponse.data.results || [];
    // Handle both string arrays and object arrays
    const context = chunks.map(c => typeof c === 'string' ? c : c.text).join('\n\n');

    const prompt = `Explain this concept in the simplest possible way, as if explaining to a 5-year-old child. Use everyday analogies and simple language.

Concept: ${concept}

Content:
${context}

Simple Explanation:`;

    const explanation = await llmClient.generateText(prompt, 800);

    res.json({
      concept,
      explanation: explanation.trim()
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate ELI5 explanation' });
  }
});

// Practice problems generator
router.post('/practice', authenticate, async (req, res) => {
  try {
    const { session_id, topic, difficulty = 'medium', count = 5 } = req.body;

    console.log(`[TUTOR] Generating ${count} practice problems: ${topic}`);

    const ragResponse = await axios.post(`${config.ragServiceUrl}/retrieve`, {
      session_id,
      query: topic,
      top_k: 10
    });

    const chunks = ragResponse.data.chunks || ragResponse.data.results || [];
    // Handle both string arrays and object arrays
    const context = chunks.map(c => typeof c === 'string' ? c : c.text).join('\n\n');

    const prompt = `Create ${count} practice problems based on this content. Difficulty level: ${difficulty}.

Content:
${context}

For each problem, provide:
- Problem statement
- Solution approach
- Final answer

Problems:`;

    const problems = await llmClient.generateText(prompt, 1500);

    res.json({
      session_id,
      topic,
      difficulty,
      count,
      problems: problems.trim()
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate practice problems' });
  }
});

// Get study recommendations
router.post('/recommend', authenticate, async (req, res) => {
  try {
    const { session_id } = req.body;

    // Get recent chat history to understand weak areas
    const recentChats = await ChatHistory.find({
      user_id: req.user._id,
      session_id
    })
    .sort({ created_at: -1 })
    .limit(10);

    const chatContext = recentChats.map(c => 
      `Q: ${c.user_message}\nA: ${c.ai_response}`
    ).join('\n\n');

    const prompt = `Based on these recent questions and answers, identify:
1. Topics the student understands well
2. Topics that need more practice
3. 3 specific study recommendations

Chat History:
${chatContext}

Recommendations:`;

    const recommendations = await llmClient.generateText(prompt, 800);

    res.json({
      session_id,
      recommendations: recommendations.trim(),
      based_on_interactions: recentChats.length
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
