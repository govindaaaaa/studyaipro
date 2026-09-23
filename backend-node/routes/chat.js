import express from 'express';
import { authenticate } from '../middleware/auth.js';
import ragClient from '../utils/ragClient.js';
import llmClient from '../utils/llmClient.js';
import ChatHistory from '../models/ChatHistory.js';
import Session from '../models/Session.js';

const router = express.Router();

/**
 * @route   POST /chat
 * @desc    Chat with document using RAG
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { session_id, message, k = 5 } = req.body;

    // Validation
    if (!session_id || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        detail: 'Please provide session_id and message'
      });
    }

    if (!message.trim()) {
      return res.status(400).json({ 
        error: 'Message cannot be empty'
      });
    }

    // Verify session belongs to user
    const session = await Session.findOne({
      session_id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found',
        detail: 'The requested session does not exist or you do not have access to it'
      });
    }

    console.log(`[CHAT] User ${req.user.email} chatting with session: ${session_id}`);

    // Retrieve relevant chunks from RAG service
    let contextChunks;
    try {
      contextChunks = await ragClient.retrieve(session_id, message, k);
    } catch (error) {
      console.error('[CHAT] Failed to retrieve context:', error.message);
      return res.status(500).json({ 
        error: 'Failed to retrieve document context',
        detail: 'Could not connect to RAG service. Please ensure it is running.'
      });
    }

    if (!contextChunks || contextChunks.length === 0) {
      return res.status(400).json({ 
        error: 'No context found',
        detail: 'Could not find relevant information in the document'
      });
    }

    console.log(`[CHAT] Retrieved ${contextChunks.length} relevant chunks`);

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({
      user_id: req.user._id,
      session_id
    });

    if (!chatHistory) {
      chatHistory = new ChatHistory({
        user_id: req.user._id,
        session_id,
        messages: []
      });
    }

    // Prepare messages for LLM (last 10 messages for context)
    const recentMessages = chatHistory.getRecentMessages(10);
    const userMessage = { role: 'user', content: message };
    
    // Generate response using LLM with context
    let response;
    try {
      response = await llmClient.chatWithContext(
        [...recentMessages, userMessage],
        contextChunks
      );
    } catch (error) {
      console.error('[CHAT] LLM generation failed:', error.message);
      return res.status(500).json({ 
        error: 'Failed to generate response',
        detail: 'Could not generate AI response. Please check your API configuration.'
      });
    }

    // Save messages to chat history
    chatHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    chatHistory.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    await chatHistory.save();

    console.log(`[CHAT] Response generated successfully`);

    // Return response
    res.json({
      response,
      session_id,
      chunks_used: contextChunks.length
    });
  } catch (error) {
    console.error('[CHAT] Error:', error);
    next(error);
  }
});

/**
 * @route   GET /chat/history/:sessionId
 * @desc    Get chat history for a session
 * @access  Private
 */
router.get('/history/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    // Verify session belongs to user
    const session = await Session.findOne({
      session_id: sessionId,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found',
        detail: 'The requested session does not exist or you do not have access to it'
      });
    }

    // Get chat history
    const chatHistory = await ChatHistory.findOne({
      user_id: req.user._id,
      session_id: sessionId
    }).lean();

    if (!chatHistory) {
      return res.json({
        session_id: sessionId,
        messages: [],
        count: 0
      });
    }

    // Limit messages if needed
    const messages = chatHistory.messages.slice(-parseInt(limit));

    res.json({
      session_id: sessionId,
      messages,
      count: messages.length,
      total_messages: chatHistory.messages.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /chat/history/:sessionId
 * @desc    Clear chat history for a session
 * @access  Private
 */
router.delete('/history/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Verify session belongs to user
    const session = await Session.findOne({
      session_id: sessionId,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found',
        detail: 'The requested session does not exist or you do not have access to it'
      });
    }

    // Find and delete chat history
    const chatHistory = await ChatHistory.findOneAndDelete({
      user_id: req.user._id,
      session_id: sessionId
    });

    if (!chatHistory) {
      return res.status(404).json({ 
        error: 'No chat history found',
        detail: 'There is no chat history for this session'
      });
    }

    console.log(`[CHAT] History cleared for session: ${sessionId}`);

    res.json({
      message: 'Chat history cleared successfully',
      session_id: sessionId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /chat/sessions
 * @desc    Get all sessions with chat history
 * @access  Private
 */
router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const chatHistories = await ChatHistory.find({
      user_id: req.user._id
    })
      .select('session_id messages created_at updated_at')
      .sort({ updated_at: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get session details for each chat history
    const sessionIds = chatHistories.map(ch => ch.session_id);
    const sessions = await Session.find({
      session_id: { $in: sessionIds },
      user_id: req.user._id
    }).lean();

    // Create a map of session details
    const sessionMap = new Map(
      sessions.map(s => [s.session_id, s])
    );

    // Combine chat history with session details
    const result = chatHistories.map(ch => {
      const session = sessionMap.get(ch.session_id);
      return {
        session_id: ch.session_id,
        filename: session?.filename || 'Unknown',
        message_count: ch.messages.length,
        last_message: ch.messages.length > 0 
          ? ch.messages[ch.messages.length - 1].content.substring(0, 100)
          : null,
        created_at: ch.created_at.toISOString(),
        updated_at: ch.updated_at.toISOString()
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /chat/continue
 * @desc    Continue conversation with additional context
 * @access  Private
 */
router.post('/continue', authenticate, async (req, res, next) => {
  try {
    const { session_id, message } = req.body;

    // Validation
    if (!session_id || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        detail: 'Please provide session_id and message'
      });
    }

    // Verify session belongs to user
    const session = await Session.findOne({
      session_id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found'
      });
    }

    // Get chat history
    const chatHistory = await ChatHistory.findOne({
      user_id: req.user._id,
      session_id
    });

    if (!chatHistory || chatHistory.messages.length === 0) {
      return res.status(400).json({ 
        error: 'No chat history found',
        detail: 'Please start a conversation first using /chat endpoint'
      });
    }

    // Get recent conversation context (no RAG retrieval for follow-ups)
    const recentMessages = chatHistory.getRecentMessages(10);
    const userMessage = { role: 'user', content: message };
    
    // Generate response using LLM without RAG context
    let response;
    try {
      const allMessages = [...recentMessages, userMessage];
      response = await llmClient.chat(allMessages);
    } catch (error) {
      console.error('[CHAT] LLM generation failed:', error.message);
      return res.status(500).json({ 
        error: 'Failed to generate response'
      });
    }

    // Save messages
    chatHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    chatHistory.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    await chatHistory.save();

    res.json({
      response,
      session_id
    });
  } catch (error) {
    next(error);
  }
});

export default router;
