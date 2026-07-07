// ---------------------------------------------------------
// config/cloudinary.js
// Configures the Cloudinary SDK and a Multer storage engine
// that streams incoming ticket proof images/videos directly
// to Cloudinary (no local disk writes needed).
// ---------------------------------------------------------

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure the Cloudinary SDK with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Allowed media types for issue proof uploads
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi', 'webm'];

// Multer-Cloudinary storage engine.
// resource_type: 'auto' lets Cloudinary detect image vs video automatically.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campusfix/ticket_proofs',
    allowed_formats: ALLOWED_FORMATS,
    resource_type: 'auto',
    // Unique public_id per upload to avoid collisions/overwrites
    public_id: (req, file) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');
      return `${safeName}_${timestamp}`;
    },
  },
});

// File filter as a second line of defense (Cloudinary also validates format)
const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (ALLOWED_FORMATS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed: jpg, png, webp, mp4, mov, avi, webm'), false);
  }
};

// Multer middleware instance - single file field named "mediaFile", 25MB cap
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

module.exports = { cloudinary, upload };
