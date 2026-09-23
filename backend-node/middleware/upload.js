import multer from 'multer';
import path from 'path';
import { config } from '../config/config.js';

// Configure storage (memory storage for processing)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (config.allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${config.allowedExtensions.join(', ')}`), false);
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize, // 20MB
    files: 1
  }
});

// Error handler for multer errors
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        detail: 'Maximum file size is 20MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files',
        detail: 'Please upload only one file at a time'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected field',
        detail: 'Please use "file" field name for upload'
      });
    }
    return res.status(400).json({ 
      error: 'File upload error',
      detail: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      error: err.message || 'File upload failed'
    });
  }
  
  next();
};

export default upload;
