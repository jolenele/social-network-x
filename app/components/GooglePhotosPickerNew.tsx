"use client";
import { useState } from "react";

interface GooglePhotosPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photoUrl: string, photoData: any) => void;
}

export default function GooglePhotosPicker({
  isOpen,
  onClose,
  onSelectPhoto,
}: GooglePhotosPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerWindow, setPickerWindow] = useState<Window | null>(null);

  async function openPicker() {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create a picker session
      const sessionRes = await fetch('/api/photos/create-session', {
        method: 'POST',
      });

      if (!sessionRes.ok) {
        const errorData = await sessionRes.json();
        throw new Error(errorData.error || 'Failed to create picker session');
      }

      const { sessionId, pickerUri } = await sessionRes.json();

      // Step 2: Open the picker URI in a popup window
      const width = 600;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        `${pickerUri}/autoclose`,
        'Google Photos Picker',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      setPickerWindow(popup);
      setLoading(false);

      // Step 3: Poll the session to check when user finishes selection
      pollSession(sessionId, popup);
    } catch (err) {
      console.error('Error opening picker:', err);
      setError(err instanceof Error ? err.message : 'Failed to open picker');
      setLoading(false);
    }
  }

  async function pollSession(sessionId: string, popup: Window) {
    const pollInterval = 2000; // 2 seconds
    const maxAttempts = 150; // 5 minutes total
    let attempts = 0;

    const poll = async () => {
      // Check if popup was closed
      if (popup.closed) {
        onClose();
        return;
      }

      attempts++;
      if (attempts > maxAttempts) {
        setError('Selection timed out');
        popup.close();
        onClose();
        return;
      }

      try {
        const pollRes = await fetch(`/api/photos/poll-session?sessionId=${sessionId}`);
        
        if (!pollRes.ok) {
          throw new Error('Failed to poll session');
        }

        const { mediaItemsSet, pollingConfig } = await pollRes.json();

        if (mediaItemsSet) {
          // Step 4: User finished selecting - get the selected media items
          const mediaRes = await fetch(`/api/photos/list-selected?sessionId=${sessionId}`);
          
          if (!mediaRes.ok) {
            throw new Error('Failed to get selected photos');
          }

          const { mediaItems } = await mediaRes.json();

          if (mediaItems && mediaItems.length > 0) {
            const firstItem = mediaItems[0];
            // Get high-quality version of the photo
            const photoUrl = `${firstItem.mediaFile.baseUrl}=w2048-h2048`;
            onSelectPhoto(photoUrl, firstItem);
          }

          popup.close();
          onClose();
        } else {
          // Continue polling
          const nextPollInterval = pollingConfig?.pollInterval || pollInterval;
          setTimeout(poll, nextPollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError(err instanceof Error ? err.message : 'Error during photo selection');
        popup.close();
        onClose();
      }
    };

    // Start polling
    setTimeout(poll, pollInterval);
  }

  // Open picker when component becomes visible
  if (isOpen && !loading && !error && !pickerWindow) {
    openPicker();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
        {loading && (
          <div className="text-center">
            <div className="text-xl text-gray-800 mb-4">Opening Google Photos...</div>
            <div className="text-sm text-gray-600">A popup window will open</div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="text-xl text-red-600 mb-4">{error}</div>
            <button
              onClick={() => {
                setError(null);
                openPicker();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="text-center">
            <div className="text-xl text-gray-800 mb-4">Select your photos in the popup window</div>
            <div className="text-sm text-gray-600 mb-4">This window will close automatically when you're done</div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
