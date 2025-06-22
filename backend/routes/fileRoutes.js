// backend/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { fileLimiter } = require('../middleware/rateLimiter'); // ← Added

const fileSchema = new mongoose.Schema({
    originalName: String,
    path: String,
    createdAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Upload route (with rate limiting)
router.post('/upload', fileLimiter, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const file = new File({
        originalName: req.file.originalname,
        path: '/uploads/' + req.file.filename
    });
    await file.save();
    res.json({ fileName: file.originalName, filePath: file.path });
});

// List files (with rate limiting)
router.get('/', fileLimiter, async (req, res) => {
    const files = await File.find();
    res.json(files);
});

// Delete file (with rate limiting)
router.delete('/:id', fileLimiter, async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const filePath = path.join(__dirname, '..', file.path);
    fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete file:', err);
    });

    await file.deleteOne();
    res.json({ message: 'File deleted' });
});

module.exports = router;
