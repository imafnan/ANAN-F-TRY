'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Lock, Mail } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in via /admin/auth/me
  useEffect(() => {
    let isMounted = true;
    apiFetch('/admin/auth/me')
      .then((data) => {
        if (isMounted && data.success) {
          router.replace(nextPath);
        }
      })
      .catch(() => {
        // Not logged in; remain on login page
      });

    return () => {
      isMounted = false;
    };
  }, [router, nextPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      if (data.success) {
        if (data.admin) {
          localStorage.setItem('forrabix_admin_user', JSON.stringify(data.admin));
        }
        router.push(nextPath);
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Unable to reach the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full border border-primary/20 p-8 bg-cream-light/10 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-widest text-primary">FORRABIX</h1>
          <p className="text-[10px] text-primary/60 tracking-widest uppercase font-semibold">ADMIN CONTROL PORTAL</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-primary uppercase block">
              Email
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                required
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary"
                disabled={loading}
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-primary/65" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-primary uppercase block">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary"
                disabled={loading}
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-primary/65" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-background text-xs font-bold tracking-widest uppercase flex items-center justify-center hover:bg-primary-hover transition-colors pt-1"
            id="admin-login-submit"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Enter Portal'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-[10px] tracking-wider text-primary/60 hover:underline uppercase">
            Return to Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <RefreshCw className="h-6 w-6 text-primary animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
