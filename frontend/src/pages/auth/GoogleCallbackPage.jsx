import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

/**
 * Handles the server-side Google OAuth redirect callback.
 *
 * Strategy: write the JWT directly into localStorage, then do a hard
 * window.location.replace('/dashboard').  The normal AuthContext
 * initializeAuth flow picks up the token from localStorage on the fresh
 * load — no context dependency, no race conditions.
 */
const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const handled = useRef(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // React 18 StrictMode runs effects twice — only handle once.
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      console.error('[GoogleCallback] Auth failed:', error || 'no token');
      setErrorMsg('Google login failed. Please try again.');
      setTimeout(() => { window.location.href = '/login'; }, 3000);
      return;
    }

    try {
      // Store the JWT so AuthContext reads it during initializeAuth.
      localStorage.setItem('token', token);
      // Remove stale user cache so a fresh /auth/me is always called.
      localStorage.removeItem('user');
    } catch (storageErr) {
      console.error('[GoogleCallback] localStorage error:', storageErr);
      setErrorMsg('Browser storage unavailable. Please enable cookies and try again.');
      setTimeout(() => { window.location.href = '/login'; }, 3000);
      return;
    }

    // Hard navigation — fresh page load, AuthContext hydrates from localStorage.
    window.location.replace('/dashboard');
  }, [searchParams]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-red-600 font-medium">{errorMsg}</p>
        <p className="text-gray-500 text-sm">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 text-sm">Signing you in with Google…</p>
    </div>
  );
};

export default GoogleCallbackPage;
