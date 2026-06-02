const admin = require('firebase-admin');
const path = require('path');
const logger = require('./logger');

try {
  // Absolute path resolution to avoid runtime execution location bugs
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  const serviceAccount = require(serviceAccountPath);

  // Fallback check to ensure your .env variables match your bucket name
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;

  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID is missing from your system .env properties configuration file.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName
  });

  logger.info(`🔥 Firebase Admin SDK successfully bound to cloud storage bucket: ${bucketName}`);

} catch (error) {
  console.error('❌ CRITICAL SYSTEM ERROR: Failed to initialize Firebase Cloud Storage Bundle:');
  console.error(error.message);
  process.exit(1); // Force terminate the application server so you don't run in a broken state
}

const bucket = admin.storage().bucket();

module.exports = bucket;