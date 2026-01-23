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
  const { login, register: registerUser, loading, error } = useAuth();
  const navigate = useNavigate();
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  const password = watch('password');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const onSubmit = async (data) => {
    if (isLogin) {
      const result = await login(data.email, data.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } else {
      const result = await registerUser(data.name, data.email, data.password);
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
                            <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
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
