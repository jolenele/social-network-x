import { getStorage } from 'firebase-admin/storage';

/**
 * Upload a base64 image data URL to Firebase Storage
 * @param dataUrl - Base64 data URL (e.g., "data:image/png;base64,iVBORw0KG...")
 * @param userId - User ID for organizing files
 * @returns Public download URL
 */
export async function uploadBase64ImageToStorage(
  dataUrl: string,
  userId: string
): Promise<string> {
  try {
    // Parse the data URL
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid data URL format');
    }

    const mimeType = matches[1]; // e.g., "image/png"
    const base64Data = matches[2]; // Base64 string without prefix

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Get storage bucket - try to get it explicitly if bucket name is available
    const storageBucketName = process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = storageBucketName 
      ? getStorage().bucket(storageBucketName)
      : getStorage().bucket();
    
    if (!bucket) {
      throw new Error('Firebase Storage bucket not configured. Please set FIREBASE_STORAGE_BUCKET environment variable or configure storageBucket in Firebase initialization.');
    }

    // Generate unique filename using timestamp and random number
    const fileExtension = mimeType.split('/')[1] || 'png';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fileName = `transformations/${userId}/${timestamp}-${random}.${fileExtension}`;

    // Upload file
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
      public: true, // Make file publicly accessible
    });

    // Make file publicly readable
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log(`✅ Image uploaded to Storage: ${publicUrl}`);
    return publicUrl;
  } catch (error: any) {
    console.error('❌ Error uploading image to Storage:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Check if a URL is a base64 data URL
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Check if a URL is already a Google Cloud Storage URL
 */
export function isGcsUrl(url: string): boolean {
  return url.startsWith('https://storage.googleapis.com/');
}

/**
 * Check if a URL is a proxy URL (starts with /api/photos/proxy-image)
 */
export function isProxyUrl(url: string): boolean {
  return url.startsWith('/api/photos/proxy-image') || url.includes('/api/photos/proxy-image');
}

/**
 * Upload an image from a URL to Firebase Storage
 * @param imageUrl - URL to the image (can be proxy URL, Google Photos URL, or direct URL)
 * @param userId - User ID for organizing files
 * @param baseUrl - Base URL of the application (for constructing full proxy URLs)
 * @param accessToken - Optional access token for authenticated requests
 * @returns Public download URL from Google Cloud Storage
 */
export async function uploadImageFromUrlToStorage(
  imageUrl: string,
  userId: string,
  baseUrl?: string,
  accessToken?: string
): Promise<string> {
  try {
    // If already a GCS URL, return as-is
    if (isGcsUrl(imageUrl)) {
      console.log('✅ Image URL is already a GCS URL, skipping upload');
      return imageUrl;
    }

    // Get storage bucket
    const storageBucketName = process.env.FIREBASE_STORAGE_BUCKET;
    const bucket = storageBucketName 
      ? getStorage().bucket(storageBucketName)
      : getStorage().bucket();
    
    if (!bucket) {
      throw new Error('Firebase Storage bucket not configured. Please set FIREBASE_STORAGE_BUCKET environment variable or configure storageBucket in Firebase initialization.');
    }

    // Determine the fetch URL
    let fetchUrl: string;
    const headers: Record<string, string> = {};

    if (isProxyUrl(imageUrl)) {
      // Extract the actual Google Photos URL from the proxy URL
      try {
        // Handle both absolute and relative proxy URLs
        const proxyUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost${imageUrl}`;
        const urlObj = new URL(proxyUrl);
        const actualUrl = urlObj.searchParams.get('url');
        if (actualUrl) {
          fetchUrl = decodeURIComponent(actualUrl);
          // Add access token if provided
          if (accessToken) {
            const url = new URL(fetchUrl);
            url.searchParams.set('access_token', accessToken);
            fetchUrl = url.toString();
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
        } else {
          throw new Error('Could not extract URL from proxy URL');
        }
      } catch (e: any) {
        throw new Error(`Invalid proxy URL format: ${imageUrl}. Error: ${e.message}`);
      }
    } else {
      // Direct URL (Google Photos or other)
      fetchUrl = imageUrl;
      if (accessToken && fetchUrl.includes('googleusercontent.com')) {
        // Add access token for Google Photos URLs
        const url = new URL(fetchUrl);
        url.searchParams.set('access_token', accessToken);
        fetchUrl = url.toString();
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    console.log('📥 Fetching image from URL:', fetchUrl.substring(0, 100) + '...');

    // Fetch the image
    const response = await fetch(fetchUrl, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Get image buffer
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Determine content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0]; // Remove charset if present
    
    // Generate unique filename
    const fileExtension = mimeType.split('/')[1] || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fileName = `transformations/${userId}/${timestamp}-${random}.${fileExtension}`;

    // Upload file
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          sourceUrl: imageUrl.substring(0, 200), // Store first 200 chars of source URL
        },
      },
      public: true, // Make file publicly accessible
    });

    // Make file publicly readable
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log(`✅ Image uploaded to Storage: ${publicUrl}`);
    return publicUrl;
  } catch (error: any) {
    console.error('❌ Error uploading image from URL to Storage:', error);
    throw new Error(`Failed to upload image from URL: ${error.message}`);
  }
}

