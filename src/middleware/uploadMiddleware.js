const multer = require('multer');
const path = require('path');

// Allocate incoming bytes straight into temporary RAM chunks (completely diskless)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  // Guard: Restrict inputs purely to standardized text/csv format
  if (fileExtension === '.csv' || file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    const error = new Error('Invalid file format. The universal ingestion parser only accepts .csv files.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB system overload protection cap
});

module.exports = upload;