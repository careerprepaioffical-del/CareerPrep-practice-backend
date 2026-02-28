import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { wakeServer } from '../../utils/api';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Best-effort: wake Render backend on first visit (no user-visible toast spam).
    wakeServer({ maxWaitMs: 12000, attemptTimeoutMs: 6000 }).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="auth-card"
    >
      <div className="mb-8">
        {/* DEBUG: Home button border/z-index for visibility */}
        <div className="flex justify-center mb-6" style={{zIndex:9999, position:'relative'}}>
          <Link
            to="/"
            className="px-6 py-3 rounded-2xl text-base font-bold shadow-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-white border-4 border-red-500 border-dashed hover:scale-105 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            style={{ minWidth: '120px', letterSpacing: '0.03em', zIndex:9999, position:'relative' }}
            aria-label="Go to Home"
          >
            Home
          </Link>
        </div>
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 24px rgba(139,92,246,0.4)' }}>
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center gradient-text mb-2">
          Welcome back
        </h2>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Sign in to your account to continue your interview preparation journey.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <p className="text-sm font-medium" style={{ color: '#fca5a5' }}>{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className={`
                input pl-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all
                ${errors.email ? 'input-error' : ''}
              `}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              type={showPassword ? 'text' : 'password'}
              className={`
                input pl-10 pr-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all
                ${errors.password ? 'input-error' : ''}
              `}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
              ) : (
                <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <button type="button" className="font-medium transition-colors" style={{ color: 'var(--violet-bright)' }}
              onMouseEnter={e => e.target.style.color='#c4b5fd'}
              onMouseLeave={e => e.target.style.color='var(--violet-bright)'}
            >
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="btn btn-primary w-full flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
        >
          {(isSubmitting || loading) ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <span>Sign in</span>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="divider w-full" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 text-xs font-medium" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn-google">
            <span className="btn-google-icon" aria-hidden="true">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              </svg>
            </span>
            <span>Google</span>
          </button>

          <button type="button" className="btn btn-secondary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>
      </form>

      {/* Sign up link */}
      <div className="mt-8 text-center">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold transition-colors" style={{ color: 'var(--violet-bright)' }}
            onMouseEnter={e => e.target.style.color='#c4b5fd'}
            onMouseLeave={e => e.target.style.color='var(--violet-bright)'}
          >
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Trust indicators */}
      <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1.5" style={{ color: '#22c55e' }} />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1.5" style={{ color: '#22c55e' }} />
            <span>Data Protected</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
