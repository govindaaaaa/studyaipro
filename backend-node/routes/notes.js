import express from 'express';
import { authenticate } from '../middleware/auth.js';
import ragClient from '../utils/ragClient.js';
import llmClient from '../utils/llmClient.js';
import Note from '../models/Note.js';
import Session from '../models/Session.js';

const router = express.Router();

/**
 * @route   POST /notes/generate
 * @desc    Generate notes from document
 * @access  Private
 */
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { session_id, mode = 'detailed', title } = req.body;

    // Validation
    if (!session_id) {
      return res.status(400).json({ 
        error: 'Missing required field',
        detail: 'Please provide session_id'
      });
    }

    if (!['basic', 'detailed', 'bullet'].includes(mode)) {
      return res.status(400).json({ 
        error: 'Invalid mode',
        detail: 'Mode must be one of: basic, detailed, bullet'
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

    console.log(`[NOTES] Generating ${mode} notes for session: ${session_id}`);

    // Get all chunks from RAG service
    let chunks;
    try {
      chunks = await ragClient.getAllChunks(session_id);
    } catch (error) {
      console.error('[NOTES] Failed to retrieve chunks:', error.message);
      return res.status(500).json({ 
        error: 'Failed to retrieve document content',
        detail: 'Could not connect to RAG service. Please ensure it is running.'
      });
    }

    if (!chunks || chunks.length === 0) {
      return res.status(400).json({ 
        error: 'No content found',
        detail: 'Could not find document content for this session'
      });
    }

    console.log(`[NOTES] Retrieved ${chunks.length} chunks`);

    // Generate notes using LLM
    let notesContent;
    try {
      notesContent = await llmClient.generateNotes(chunks, mode);
    } catch (error) {
      console.error('[NOTES] LLM generation failed:', error.message);
      return res.status(500).json({ 
        error: 'Failed to generate notes',
        detail: 'Could not generate notes. Please check your API configuration.'
      });
    }

    // Generate title if not provided
    const noteTitle = title || `${mode.charAt(0).toUpperCase() + mode.slice(1)} Notes - ${session.filename}`;

    // Save notes to database
    const note = new Note({
      user_id: req.user._id,
      session_id,
      title: noteTitle,
      content: notesContent,
      mode
    });

    await note.save();

    console.log(`[NOTES] Notes saved successfully (ID: ${note._id})`);

    res.status(201).json({
      note_id: note._id,
      title: note.title,
      content: notesContent,
      mode,
      session_id,
      created_at: note.created_at.toISOString()
    });
  } catch (error) {
    console.error('[NOTES] Error:', error);
    next(error);
  }
});

/**
 * @route   GET /notes
 * @desc    Get all notes for current user
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { limit = 20, skip = 0, session_id } = req.query;

    const query = { user_id: req.user._id };
    if (session_id) {
      query.session_id = session_id;
    }

    const notes = await Note.find(query)
      .select('_id title mode session_id created_at')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Get session details
    const sessionIds = [...new Set(notes.map(n => n.session_id))];
    const sessions = await Session.find({
      session_id: { $in: sessionIds }
    }).lean();

    const sessionMap = new Map(
      sessions.map(s => [s.session_id, s.filename])
    );

    // Add filename to each note
    const result = notes.map(note => ({
      note_id: note._id,
      title: note.title,
      mode: note.mode,
      session_id: note.session_id,
      filename: sessionMap.get(note.session_id) || 'Unknown',
      created_at: note.created_at.toISOString()
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /notes/:noteId
 * @desc    Get specific note by ID
 * @access  Private
 */
router.get('/:noteId', authenticate, async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOne({
      _id: noteId,
      user_id: req.user._id
    }).lean();

    if (!note) {
      return res.status(404).json({ 
        error: 'Note not found',
        detail: 'The requested note does not exist or you do not have access to it'
      });
    }

    // Get session details
    const session = await Session.findOne({
      session_id: note.session_id
    }).lean();

    res.json({
      note_id: note._id,
      title: note.title,
      content: note.content,
      mode: note.mode,
      session_id: note.session_id,
      filename: session?.filename || 'Unknown',
      created_at: note.created_at.toISOString(),
      updated_at: note.updated_at.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /notes/session/:sessionId
 * @desc    Get all notes for a specific session
 * @access  Private
 */
router.get('/session/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Verify session belongs to user
    const session = await Session.findOne({
      session_id: sessionId,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found'
      });
    }

    const notes = await Note.find({
      user_id: req.user._id,
      session_id: sessionId
    })
      .select('_id title content mode created_at')
      .sort({ created_at: -1 })
      .lean();

    const result = notes.map(note => ({
      note_id: note._id,
      title: note.title,
      content: note.content,
      mode: note.mode,
      created_at: note.created_at.toISOString()
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /notes/:noteId
 * @desc    Update note title or content
 * @access  Private
 */
router.put('/:noteId', authenticate, async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({ 
        error: 'Nothing to update',
        detail: 'Please provide title or content to update'
      });
    }

    const note = await Note.findOne({
      _id: noteId,
      user_id: req.user._id
    });

    if (!note) {
      return res.status(404).json({ 
        error: 'Note not found'
      });
    }

    // Update fields
    if (title) note.title = title;
    if (content) note.content = content;

    await note.save();

    console.log(`[NOTES] Note updated: ${noteId}`);

    res.json({
      note_id: note._id,
      title: note.title,
      content: note.content,
      mode: note.mode,
      updated_at: note.updated_at.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /notes/:noteId
 * @desc    Delete a note
 * @access  Private
 */
router.delete('/:noteId', authenticate, async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      user_id: req.user._id
    });

    if (!note) {
      return res.status(404).json({ 
        error: 'Note not found'
      });
    }

    console.log(`[NOTES] Note deleted: ${noteId}`);

    res.json({
      message: 'Note deleted successfully',
      note_id: noteId
    });
  } catch (error) {
    next(error);
  }
});

export default router;
