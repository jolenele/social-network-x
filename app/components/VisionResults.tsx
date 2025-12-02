"use client"; // This marks the file as a client component in Next.js

import { useState } from "react"; // Import React useState hook for component state
import type { VisionValidationResult } from "../utils/visionValidation"; // Import type for vision validation results

// Define the props interface for VisionResults component
interface VisionResultsProps {
  isOpen: boolean; // Determines if the modal/component should be visible
  onClose: () => void; // Function to close the modal/component
  isLoading: boolean; // Flag indicating if the vision analysis is in progress
  error: string | null; // Any error message returned from the analysis
  labels: Array<{ description: string; score: number }> | null; // Array of labels detected by the vision API
  raw: any | null; // Raw response from the vision API
  validation?: VisionValidationResult | null; // Optional validation object
}

// Main component function definition
export default function VisionResults({ isOpen, onClose, isLoading, error, labels, raw, validation }: VisionResultsProps) {
  const [showRaw, setShowRaw] = useState(false); // Local state to toggle raw JSON display

  if (!isOpen) return null; // If the component is not open, render nothing

  return (
    <div className=" bg-white rounded-md shadow-md p-4 mr-6"> {/* Main container with styling */}
      <div className="flex justify-between items-center"> {/* Header container with flex layout */}
        <h3 className="text-lg font-medium">Vision Results</h3> {/* Title of the modal/component */}
        <div className="flex items-center space-x-2"> {/* Container for buttons */}
          <button
            onClick={() => setShowRaw((s) => !s)} // Toggle showRaw state when clicked
            className="px-2 py-1 text-sm border rounded bg-gray-100" // Styling for toggle button
          >
            {showRaw ? "Hide Raw" : "Show Raw"}
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm border rounded bg-red-100"
          >
            Dismiss
          </button>
        </div>
      </div>

      {isLoading && <div className="mt-2">Loading analysis...</div>}

      {error && (
        <div className="mt-2 text-red-600">Error running Vision: {error}</div>
      )}

      {/* Validation Status */}
      {!isLoading && validation && (
        <div className="mt-3 p-3 bg-gray-50 rounded border">
          <div className="text-sm font-medium mb-2">Image Validation</div>
          
          {/* Face Detection Status */}
          <div className="flex items-center space-x-2 mb-1">
            <span className={validation.hasDetectedFace ? "text-green-600" : "text-red-600"}>
              {validation.hasDetectedFace ? "✓" : "✗"}
            </span>
            <span className="text-sm">
              {validation.hasDetectedFace 
                ? `Face detected (${validation.faceCount})` 
                : "No face detected"}
            </span>
          </div>

          {/* Safety Check Status */}
          <div className="flex items-center space-x-2 mb-1">
            <span className={validation.isSafeContent ? "text-green-600" : "text-red-600"}>
              {validation.isSafeContent ? "✓" : "✗"}
            </span>
            <span className="text-sm">
              {validation.isSafeContent ? "Content safe" : "Inappropriate content"}
            </span>
          </div>

          {/* Overall Status */}
          <div className="flex items-center space-x-2 mt-2 pt-2 border-t">
            <span className={validation.isValid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {validation.isValid ? "✓ Ready for processing" : "✗ Cannot process"}
            </span>
          </div>

          {/* Error Message */}
          {validation.errorMessage && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {validation.errorMessage}
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="mt-2 space-y-1">
              {validation.warnings.map((warning, idx) => (
                <div key={idx} className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                  ⚠️ {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && labels && (
        <div className="mt-3">
          <div className="text-sm text-gray-600 mb-2">Top labels (description — score)</div>
          <ul className="list-disc pl-5 space-y-1 columns-2">
            {labels.map((l, idx) => (
              <li key={idx} className="text-sm">
                <strong>{l.description}</strong> — {(l.score * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {showRaw && (
        <div className="mt-3">
          <pre className="max-h-[220px] overflow-auto text-xs bg-gray-50 p-2 rounded">
            {JSON.stringify(raw, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
