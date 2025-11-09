"use client";
import React from 'react';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Force navigation to home — session cookie cleared server-side
      window.location.href = '/';
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="ml-4 inline-flex items-center px-4 py-2 text-black text-2xl font-medium hover:underline font-['Comfortaa',sans-serif]"
    >
      Logout
    </button>
  );
}
