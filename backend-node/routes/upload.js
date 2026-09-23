import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import { upload, handleMulterError } from '../middleware/upload.js';
import { extractText, validateExtractedText } from '../utils/fileExtractor.js';
import { chunkText, cleanText } from '../utils/textProcessor.js';
import ragClient from '../utils/ragClient.js';
import Session from '../models/Session.js';

const router = express.Router();

/**
 * @route   POST /upload
 * @desc    Upload and process PDF/TXT file
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  handleMulterError,
  async (req, res, next) => {
    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file provided',
          detail: 'Please upload a PDF, TXT, or MD file'
        });
      }

      const { originalname, buffer, size } = req.file;
      console.log(`[UPLOAD] Processing file: ${originalname} (${(size / 1024).toFixed(2)} KB)`);

      // Extract text from file
      let text;
      try {
        text = await extractText(buffer, originalname);
      } catch (error) {
        console.error('[UPLOAD] Text extraction failed:', error.message);
        return res.status(400).json({ 
          error: 'Failed to extract text from file',
          detail: error.message
        });
      }

      // Clean text
      text = cleanText(text);

      // Validate extracted text
      if (!validateExtractedText(text, 100)) {
        return res.status(400).json({ 
          error: 'Could not extract meaningful text from file',
          detail: 'The file must contain at least 100 characters of readable text'
        });
      }

      // Chunk text
      const chunks = chunkText(text);
      
      if (chunks.length === 0) {
        return res.status(400).json({ 
          error: 'No valid text chunks generated',
          detail: 'The file may be too short or contain invalid content'
        });
      }

      console.log(`[UPLOAD] Generated ${chunks.length} chunks from ${text.length} characters`);

      // Generate unique session ID
      const sessionId = uuidv4();

      // Store chunks in FAISS via RAG microservice
      try {
        await ragClient.addChunks(sessionId, chunks);
        console.log(`[UPLOAD] Chunks stored in vector database for session: ${sessionId}`);
      } catch (error) {
        console.error('[UPLOAD] Failed to store chunks:', error.message);
        return res.status(500).json({ 
          error: 'Failed to process document',
          detail: 'Could not store document in vector database. Please ensure RAG service is running.'
        });
      }

      // Save session to MongoDB
      const session = new Session({
        session_id: sessionId,
        user_id: req.user._id,
        filename: originalname,
        chunk_count: chunks.length,
        char_count: text.length
      });

      await session.save();
      console.log(`[UPLOAD] Session saved to database: ${sessionId}`);

      // Return success response
      res.status(201).json({
        session_id: sessionId,
        filename: originalname,
        chunks: chunks.length,
        chars: text.length,
        message: 'File uploaded and processed successfully'
      });
    } catch (error) {
      console.error('[UPLOAD] Error:', error);
      next(error);
    }
  }
);

/**
 * @route   GET /upload/sessions
 * @desc    List user's upload sessions
 * @access  Private
 */
router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const sessions = await Session.find({ user_id: req.user._id })
      .select('session_id filename chunk_count char_count created_at')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Format dates for response
    const formattedSessions = sessions.map(session => ({
      session_id: session.session_id,
      filename: session.filename,
      chunk_count: session.chunk_count,
      char_count: session.char_count,
      created_at: session.created_at.toISOString()
    }));

    res.json({ sessions: formattedSessions });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /upload/sessions/:sessionId
 * @desc    Get specific session details
 * @access  Private
 */
router.get('/sessions/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ 
      session_id: sessionId,
      user_id: req.user._id 
    }).lean();

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found',
        detail: 'The requested session does not exist or you do not have access to it'
      });
    }

    res.json({
      session_id: session.session_id,
      filename: session.filename,
      chunk_count: session.chunk_count,
      char_count: session.char_count,
      created_at: session.created_at.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /upload/sessions/:sessionId
 * @desc    Delete a session
 * @access  Private
 */
router.delete('/sessions/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Find and delete session
    const session = await Session.findOneAndDelete({ 
      session_id: sessionId,
      user_id: req.user._id 
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found',
        detail: 'The requested session does not exist or you do not have access to it'
      });
    }

    // Note: FAISS data cleanup would need to be implemented in RAG service
    // For now, we just delete the MongoDB record

    console.log(`[UPLOAD] Session deleted: ${sessionId}`);

    res.json({ 
      message: 'Session deleted successfully',
      session_id: sessionId
    });
  } catch (error) {
    next(error);
  }
});

export default router;
