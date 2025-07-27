const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fileshare_uploads',
    allowed_formats: ['jpg', 'png', 'pdf', 'zip', 'txt', 'mp4'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const parser = multer({ storage: storage });

module.exports = parser;
