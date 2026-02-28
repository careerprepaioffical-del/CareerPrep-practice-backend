import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, Sparkles, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';


const motivationalQuotes = [
  "Every expert was once a beginner",
  "Your next opportunity is one interview away",
  "Preparation is the key to confidence",
  "Dream big, prepare bigger"
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const {
    login,
    register: registerUser,
    requestSignupOtp,
    requestPasswordResetOtp,
    resetPasswordWithOtp,
    clearError,
    loading,
    error
  } = useAuth();
  const navigate = useNavigate();
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const googleAuthUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm({ mode: 'onChange' });

  const password = watch('password');
  const emailValue = watch('email');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
    clearError();
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpSent(false);
    setShowForgotPassword(false);
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail(emailValue || '');
    setResetOtp('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetOtpSent(false);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetOtp('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetOtpSent(false);
    setResetLoading(false);
  };

  const onSendResetOtp = async () => {
    const email = String(resetEmail || '').trim();
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) return;

    setResetLoading(true);
    const result = await requestPasswordResetOtp(email);
    setResetLoading(false);
    if (result.success) setResetOtpSent(true);
  };

  const onResetPassword = async () => {
    const email = String(resetEmail || '').trim();
    const otp = String(resetOtp || '').trim();

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) return;
    if (!/^\d{6}$/.test(otp)) return;
    if (resetNewPassword.length < 6) return;
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(resetNewPassword)) return;
    if (resetNewPassword !== resetConfirmPassword) return;

    setResetLoading(true);
    const result = await resetPasswordWithOtp({ email, otp, newPassword: resetNewPassword });
    setResetLoading(false);
    if (result.success) {
      closeForgotPassword();
      setIsLogin(true);
    }
  };

  const onSendOtp = async () => {
    // Validate the email field before calling the API
    const valid = await trigger('email');
    if (!valid || !emailValue) return;
    setOtpSending(true);
    const result = await requestSignupOtp(emailValue);
    setOtpSending(false);
    if (result.success) {
      setOtpSent(true);
    }
  };

  const onSubmit = async (data) => {
    if (isLogin) {
      const result = await login(data.email, data.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } else {
      const result = await registerUser(data.name, data.email, data.password, data.otp);
      if (result.success) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200 rounded-full blur-3xl"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center relative z-10 px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Motivation Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="text-center lg:text-left">
                {/* Logo */}
                <div className="flex items-center justify-center lg:justify-start mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                    <img
                      src="/image.png"
                      alt="CareerPrep Ai"
                      className="relative w-16 h-16 rounded-2xl object-cover shadow-2xl ring-4 ring-white"
                    />
                  </div>
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold gradient-text">CareerPrep Ai</h1>
                    <p className="text-sm text-secondary-600 font-medium">AI-Powered Interview Mastery</p>
                  </div>
                </div>

                {/* Motivational Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
                    {isLogin ? 'Welcome Back!' : 'Start Your Journey'}
                  </h2>
                  <p className="text-lg text-secondary-600 mb-8">
                    {isLogin 
                      ? 'Continue mastering your interview skills and achieving your career goals.'
                      : 'Join us today and transform your interview preparation with AI-powered guidance.'}
                  </p>

                  {/* Motivational Quote */}
                  <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 mb-8 border-2 border-primary-100 shadow-xl">
                    <div className="flex items-center justify-center lg:justify-start mb-3">
                      <Sparkles className="w-5 h-5 text-primary-600 mr-2" />
                      <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">Daily Motivation</span>
                    </div>
                    <p className="text-lg font-medium text-secondary-700 italic">
                      "{randomQuote}"
                    </p>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <Target className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-secondary-700 text-center">Plan Your Success</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <TrendingUp className="w-8 h-8 text-success-600 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-secondary-700 text-center">Track Progress</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <Sparkles className="w-8 h-8 text-warning-600 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-secondary-700 text-center">Master Interviews</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Auth Form Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-secondary-100">
                {/* Toggle Buttons */}
                <div className="flex bg-secondary-100 rounded-xl p-1 mb-8">
                  <button
                    type="button"
                    onClick={() => !isLogin && toggleMode()}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      isLogin
                        ? 'bg-white text-primary-600 shadow-md'
                        : 'text-secondary-600 hover:text-secondary-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => isLogin && toggleMode()}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      !isLogin
                        ? 'bg-white text-primary-600 shadow-md'
                        : 'text-secondary-600 hover:text-secondary-900'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                        {isLogin ? 'Welcome back' : 'Create your account'}
                      </h2>
                      <p className="text-secondary-600">
                        {isLogin
                          ? 'Sign in to continue your interview preparation journey.'
                          : 'Join thousands preparing for their dream jobs.'}
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-error-50 border-2 border-error-200 rounded-xl shadow-lg"
                      >
                        <p className="text-sm text-error-700 font-medium">{error}</p>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      {/* Google Sign-In — server-side redirect flow */}
                      <div className="space-y-3">
                        <a
                          href={googleAuthUrl}
                          className="btn-google"
                        >
                          <span className="btn-google-icon" aria-hidden="true">
                            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          </span>
                          <span>Continue with Google</span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </a>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-secondary-200" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                              <span className="px-2 bg-white text-secondary-500">or continue with email</span>
                          </div>
                        </div>
                      </div>

                      {/* Name Field (Register only) */}
                      {!isLogin && (
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                            Full name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-secondary-400" />
                            </div>
                            <input
                              {...register('name', {
                                required: !isLogin && 'Full name is required',
                                minLength: {
                                  value: 2,
                                  message: 'Name must be at least 2 characters'
                                }
                              })}
                              type="text"
                              className={`input pl-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all ${
                                errors.name ? 'input-error' : ''
                              }`}
                              placeholder="Enter your full name"
                              autoComplete="name"
                            />
                          </div>
                          {errors.name && (
                            <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                          )}
                        </div>
                      )}

                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                          Email address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-secondary-400" />
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
                            className={`input pl-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all ${
                              errors.email ? 'input-error' : ''
                            }`}
                            placeholder="Enter your email"
                            autoComplete="email"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                        )}
                      </div>

                      {/* OTP (Register only) */}
                      {!isLogin && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label htmlFor="otp" className="block text-sm font-medium text-secondary-700">
                              OTP code
                            </label>
                            <button
                              type="button"
                              onClick={onSendOtp}
                              disabled={otpSending || !emailValue || !!errors.email}
                              className="text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
                            >
                              {otpSending ? 'Sending…' : (otpSent ? 'Resend OTP' : 'Send OTP')}
                            </button>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-secondary-400" />
                            </div>
                            <input
                              {...register('otp', {
                                required: !isLogin && 'OTP is required',
                                pattern: {
                                  value: /^\d{6}$/,
                                  message: 'OTP must be 6 digits'
                                }
                              })}
                              inputMode="numeric"
                              maxLength={6}
                              className={`input pl-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all ${
                                errors.otp ? 'input-error' : ''
                              }`}
                              placeholder="Enter 6-digit OTP"
                              autoComplete="one-time-code"
                            />
                          </div>
                          {otpSent && !errors.otp && (
                            <p className="mt-1 text-xs text-secondary-500">We sent a code to your email.</p>
                          )}
                          {errors.otp && (
                            <p className="mt-1 text-sm text-error-600">{errors.otp.message}</p>
                          )}
                        </div>
                      )}

                      {/* Password Field */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-secondary-400" />
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
                            className={`input pl-10 pr-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all ${
                              errors.password ? 'input-error' : ''
                            }`}
                            placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
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

                      {/* Confirm Password (Register only) */}
                      {!isLogin && (
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                            Confirm password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-secondary-400" />
                            </div>
                            <input
                              {...register('confirmPassword', {
                                required: !isLogin && 'Please confirm your password',
                                validate: value => isLogin || value === password || 'Passwords do not match'
                              })}
                              type={showConfirmPassword ? 'text' : 'password'}
                              className={`input pl-10 pr-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all ${
                                errors.confirmPassword ? 'input-error' : ''
                              }`}
                              placeholder="Confirm your password"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                              ) : (
                                <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      )}

                      {/* Remember Me / Terms */}
                      {isLogin ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              id="remember-me"
                              name="remember-me"
                              type="checkbox"
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                              Remember me
                            </label>
                          </div>
                          <div className="text-sm">
                            <button
                              type="button"
                              onClick={openForgotPassword}
                              className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Forgot password?
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              {...register('acceptTerms', {
                                required: !isLogin && 'You must accept the terms'
                              })}
                              id="accept-terms"
                              type="checkbox"
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="accept-terms" className="text-secondary-700">
                              I agree to the{' '}
                              <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                                Terms of Service
                              </button>{' '}
                              and{' '}
                              <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                                Privacy Policy
                              </button>
                            </label>
                            {errors.acceptTerms && (
                              <p className="mt-1 text-sm text-error-600">{errors.acceptTerms.message}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="btn btn-primary w-full flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                      >
                        {isSubmitting || loading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <>
                            <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      {isLogin && showForgotPassword && (
                        <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-secondary-800">Reset password with OTP</h3>
                            <button
                              type="button"
                              onClick={closeForgotPassword}
                              className="text-xs font-medium text-secondary-500 hover:text-secondary-700"
                            >
                              Close
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="input"
                              placeholder="Enter your account email"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-secondary-700 mb-1">OTP</label>
                              <input
                                type="text"
                                value={resetOtp}
                                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="input"
                                placeholder="6-digit OTP"
                                inputMode="numeric"
                                maxLength={6}
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={onSendResetOtp}
                                disabled={resetLoading || !resetEmail}
                                className="btn btn-secondary w-full"
                              >
                                {resetLoading ? 'Sending…' : resetOtpSent ? 'Resend OTP' : 'Send OTP'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary-700 mb-1">New password</label>
                            <div className="relative">
                              <input
                                type={showResetPassword ? 'text' : 'password'}
                                value={resetNewPassword}
                                onChange={(e) => setResetNewPassword(e.target.value)}
                                className="input pr-10"
                                placeholder="At least 6 chars with A-Z, a-z, 0-9"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowResetPassword((prev) => !prev)}
                              >
                                {showResetPassword ? (
                                  <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                                ) : (
                                  <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-secondary-700 mb-1">Confirm new password</label>
                            <div className="relative">
                              <input
                                type={showResetConfirmPassword ? 'text' : 'password'}
                                value={resetConfirmPassword}
                                onChange={(e) => setResetConfirmPassword(e.target.value)}
                                className="input pr-10"
                                placeholder="Re-enter new password"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                              >
                                {showResetConfirmPassword ? (
                                  <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                                ) : (
                                  <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                                )}
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={onResetPassword}
                            disabled={resetLoading}
                            className="btn btn-primary w-full"
                          >
                            {resetLoading ? 'Resetting…' : 'Reset password'}
                          </button>
                        </div>
                      )}

                      {/* Trust Indicators */}
                      <div className="pt-4 border-t border-secondary-200">
                        <div className="flex items-center justify-center space-x-6 text-xs text-secondary-500">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-success-500 mr-1" />
                            <span>{isLogin ? 'Secure Login' : 'Free Forever'}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-success-500 mr-1" />
                            <span>{isLogin ? 'Data Protected' : 'No Credit Card'}</span>
                          </div>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
