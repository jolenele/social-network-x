"use client";
import { useState } from "react";

export default function EditorPage() {
  const [color, setColor] = useState("");
  const [style, setStyle] = useState("");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Editor</h1>

      <div className="max-w-xl space-y-4">
        <label className="block">
          <span className="text-sm">Hair color</span>
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Pink"
            className="w-full mt-1 px-3 py-2 border rounded"
          />
        </label>

        <label className="block">
          <span className="text-sm">Hairstyle</span>
          <input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="e.g. Mohawk, No beard"
            className="w-full mt-1 px-3 py-2 border rounded"
          />
        </label>

        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Apply</button>
      </div>
    </div>
  );
}