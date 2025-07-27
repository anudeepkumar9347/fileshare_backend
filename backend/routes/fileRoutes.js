const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { fileLimiter } = require('../middleware/rateLimiter');
const { param, validationResult } = require('express-validator');
const File = require('../models/File');
const upload = require('../middleware/cloudinaryStorage');
const cloudinary = require('../../config/cloudinary');

// JWT auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Auth token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

router.use(fileLimiter);

// UPLOAD
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'File upload failed' });
    }

    const file = new File({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      cloudinaryUrl: req.file.path,
      user: req.user.id
    });

    await file.save();

    res.status(201).json({
      fileId: file._id,
      fileName: file.originalName,
      downloadLink: file.cloudinaryUrl
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// LIST FILES
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id });

    res.json(files.map(f => ({
      fileId: f._id,
      fileName: f.originalName,
      downloadLink: f.cloudinaryUrl
    })));
  } catch (err) {
    console.error('Fetching files error:', err);
    res.status(500).json({ message: 'Server error fetching files' });
  }
});

// DOWNLOAD
router.get(
  '/download/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid file ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const file = await File.findById(req.params.id);
      if (!file || file.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'File not found or unauthorized' });
      }

      if (!file.cloudinaryUrl) {
        return res.status(404).json({ message: 'Cloudinary URL missing for this file' });
      }

      res.redirect(file.cloudinaryUrl);
    } catch (err) {
      console.error('Download error:', err);
      res.status(500).json({ message: 'Server error during file download' });
    }
  }
);

// DELETE
router.delete(
  '/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid file ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const file = await File.findOne({ _id: req.params.id, user: req.user.id });
      if (!file) return res.status(404).json({ message: 'File not found' });

      if (file.cloudinaryUrl) {
        try {
          const publicId = file.cloudinaryUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`fileshare_uploads/${publicId}`, { resource_type: 'auto' });
        } catch (err) {
          console.error('Cloudinary delete failed:', err.message);
        }
      }

      await file.deleteOne();
      res.json({ message: 'File deleted successfully' });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ message: 'Server error during file deletion' });
    }
  }
);

module.exports = router;
