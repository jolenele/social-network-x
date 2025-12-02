// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const PORT = process.env.PORT || 3001;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

console.log('PORT:', process.env.PORT);
console.log('STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET);
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);


// Initialize Firebase Admin SDK
// Option A: GOOGLE_APPLICATION_CREDENTIALS env pointing to file (recommended)
// Option B: use inline JSON in env (not recommended for repo)
if (!admin.apps.length) {
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: STORAGE_BUCKET,
      });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(sa),
        storageBucket: STORAGE_BUCKET,
      });
    } else {
      console.warn('No Firebase credentials found (GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON). Some features will fail.');
      // initializeAdmin without credentials may also work if running on GCP with proper service account
      admin.initializeApp({
        storageBucket: STORAGE_BUCKET,
      });
    }
  } catch (err) {
    console.error('Firebase init error:', err);
    // try a fallback init to avoid crashing during dev
    try { admin.initializeApp({ storageBucket: STORAGE_BUCKET }); } catch(e){ /* ignore */ }
  }
}

const db = admin.firestore ? admin.firestore() : null;
const bucket = admin.storage ? admin.storage().bucket() : null;

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

/**
 * Utility: download remote image to buffer
 */
async function downloadImageToBuffer(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data, 'binary');
}

/**
 * Save a buffer to Firebase Storage and return public URL
 */
async function uploadBufferToStorage(buffer, destPath, contentType = 'image/png') {
  if (!bucket) throw new Error('Storage bucket not initialized');
  const file = bucket.file(destPath);
  await file.save(buffer, { contentType, resumable: false });

  // Make it publicly readable
  await file.makePublic();
  
  // Make public link (note: for production, set proper ACL or use signed URLs)
  // We'll return the gs:// path or the public https URL if possible
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  return { publicUrl, path: file.name };
}

/**
 * POST /api/transformations/save
 * Expects JSON:
 * {
 *  originalImageUrl: string,
 *  transformedImageUrl: string,  // could be a remote URL or data URL
 *  hairColor?: string,
 *  hairStyle?: string
 * }
 */
app.post('/api/transformations/save', async (req, res) => {
  try {
    const { originalImageUrl, transformedImageUrl, hairColor, hairStyle } = req.body;
    if (!originalImageUrl || !transformedImageUrl) {
      return res.status(400).json({ error: 'originalImageUrl and transformedImageUrl are required' });
    }

    // Option: download remote images and store locally in Firebase Storage.
    // We'll download the transformed image (since you probably want it in your Storage).
    const id = uuidv4();
    let transformedStoragePath = null;
    let transformedPublicUrl = transformedImageUrl; // fallback: store original URL if upload fails

    try {
      const buffer = await downloadImageToBuffer(transformedImageUrl);
      const ext = '.png';
      const destPath = `transformations/${id}${ext}`;
      const uploadResult = await uploadBufferToStorage(buffer, destPath, 'image/png');
      transformedStoragePath = uploadResult.path;
      transformedPublicUrl = uploadResult.publicUrl;
    } catch (err) {
      console.warn('Could not download/upload transformed image, saving remote URL instead:', err.message || err);
      // keep transformedPublicUrl as the provided URL
    }

    // Optionally, do same for originalImageUrl if you want a canonical copy in storage.

    // Save metadata to Firestore
    let docRef;
    if (db) {
      const now = new Date().toISOString();
      docRef = await db.collection('transformations').add({
        originalImageUrl,
        transformedImageUrl: transformedPublicUrl,
        transformedStoragePath: transformedStoragePath || null,
        hairColor: hairColor || null,
        hairStyle: hairStyle || null,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // If Firestore isn't initialized, return a simulated response
      return res.status(500).json({ error: 'Firestore not initialized on server' });
    }

    const result = {
      id: docRef.id,
      originalImageUrl,
      transformedImageUrl: transformedPublicUrl,
      hairColor,
      hairStyle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json(result);
  } catch (error) {
    console.error('Error saving transformation:', error);
    return res.status(500).json({ error: 'Failed to save transformation', detail: error.message });
  }
});

/**
 * GET /api/transformations/list
 * Query params:
 *  limit (default 50)
 *  lastDocId (optional)
 */
app.get('/api/transformations/list', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Firestore not initialized' });

    const limit = Number(req.query.limit) || 50;
    const lastDocId = req.query.lastDocId || null;

    let q = db.collection('transformations').orderBy('createdAt', 'desc').limit(limit);

    if (lastDocId) {
      const lastDocSnap = await db.collection('transformations').doc(String(lastDocId)).get();
      if (lastDocSnap.exists) {
        q = q.startAfter(lastDocSnap);
      }
    }

    const snapshot = await q.get();
    const transformations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({
      transformations,
      count: transformations.length,
      limit,
      hasMore: transformations.length === limit,
      lastDocId: transformations.length ? transformations[transformations.length - 1].id : null,
    });
  } catch (err) {
    console.error('Error listing transformations:', err);
    res.status(500).json({ error: err.message || 'Failed to list transformations' });
  }
});

/**
 * DELETE /api/transformations/:id
 */
app.delete('/api/transformations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!db) return res.status(500).json({ error: 'Firestore not initialized' });

    const docRef = db.collection('transformations').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Transformation not found' });
    const data = doc.data();

    // delete storage file if we saved it
    if (data && data.transformedStoragePath && bucket) {
      try {
        await bucket.file(data.transformedStoragePath).delete();
      } catch (err) {
        console.warn('Failed to delete storage file:', err.message || err);
      }
    }

    await docRef.delete();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting transformation:', err);
    res.status(500).json({ error: err.message || 'Failed to delete transformation' });
  }
});

/**
 * POST /api/photos/vision
 * Body: { imageUrl: string }
 * -> Calls Google Vision (if set up) or returns a simple placeholder
 */
app.post('/api/photos/vision', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });

    // If you want to integrate real Vision API, replace this block with @google-cloud/vision client usage.
    // For now we'll return a lightweight mock to let the frontend continue to work.
    if (!process.env.GOOGLE_VISION_KEY) {
      // Mock response structure used by your app
      return res.json({
        visionResponse: {
          labels: [
            { description: 'Person', score: 0.98 },
            { description: 'Hair', score: 0.76 },
          ],
        },
      });
    }

    // TODO: integrate real Vision API if you set GOOGLE_VISION_KEY/credentials
    return res.json({
      visionResponse: {
        labels: [{ description: 'Mock label (replace with real Vision API)' }],
      },
    });
  } catch (err) {
    console.error('Vision error:', err);
    res.status(500).json({ error: err.message || 'Vision processing failed' });
  }
});

/**
 * POST /api/gemini/generate
 * Body: { imageUrl: string, prompt: string, hairColor?:string, hairStyle?:string }
 * -> Calls Gemini (placeholder). Returns { imageUrl: 'generated-image-url' }
 */
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { imageUrl, prompt, hairColor, hairStyle } = req.body;
    if (!imageUrl || !prompt) return res.status(400).json({ error: 'imageUrl and prompt required' });

    // If you have a Gemini / LLM image generation API, call it here.
    // For now, we'll mock by returning the original image URL (no-op) so frontend flow continues.
    // Replace this with a real call to the Gemini image generation endpoint when you have API access.
    return res.json({
      imageUrl, // TODO: replace with generated image url
      message: 'Mock: replace with real Gemini generated image URL',
    });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: err.message || 'Gemini generation failed' });
  }
});

/**
 * Simple health endpoint
 */
app.get('/_health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Express backend listening on port ${PORT}`);
});
