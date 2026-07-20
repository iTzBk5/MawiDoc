import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import logger from '../shared/utils/logger';

const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    // @ts-ignore
    admin.initializeApp({
      // @ts-ignore
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  logger.warn('serviceAccountKey.json not found. Firebase push notifications will be disabled.');
}

export default admin;
