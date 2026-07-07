// ---------------------------------------------------------
// middleware/upload.js
// Thin wrapper around the Cloudinary/Multer config so routes
// only need to import one clearly-named middleware for the
// "proof media" upload field used on ticket creation.
// ---------------------------------------------------------

const { upload } = require('../config/cloudinary');

// Accepts a single file from the multipart field named "mediaFile"
const uploadTicketMedia = upload.single('mediaFile');

// Wraps multer's callback-style middleware in a promise-friendly
// handler so upload errors flow into the centralized error handler
// instead of crashing the request silently.
const handleTicketMediaUpload = (req, res, next) => {
  uploadTicketMedia(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = { handleTicketMediaUpload };
