import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading, error } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await registerUser(data.name, data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-2xl p-8 border border-secondary-100"
    >
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-success-500 to-success-700 p-3 rounded-xl shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center gradient-text mb-2">
          Create your account
        </h2>
        <p className="text-secondary-600 text-center">
          Join thousands of candidates who have landed their dream jobs with CareerPrep Ai.
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
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
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 50,
                  message: 'Name cannot exceed 50 characters'
                }
              })}
              type="text"
              className={`
                input pl-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all
                ${errors.name ? 'input-error' : ''}
              `}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
          )}
        </div>

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
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                }
              })}
              type={showPassword ? 'text' : 'password'}
              className={`
                input pl-10 pr-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all
                ${errors.password ? 'input-error' : ''}
              `}
              placeholder="Create a password"
              autoComplete="new-password"
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

        {/* Confirm Password Field */}
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
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              className={`
                input pl-10 pr-10 shadow-sm hover:shadow-md focus:shadow-lg transition-all
                ${errors.confirmPassword ? 'input-error' : ''}
              `}
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

        {/* Terms and Privacy */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...register('acceptTerms', {
                required: 'You must accept the terms and conditions'
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
          </div>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-error-600">{errors.acceptTerms.message}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="btn btn-primary w-full flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
        >
          {(isSubmitting || loading) ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <span>Create account</span>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-secondary-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="btn btn-secondary flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>
      </form>

      {/* Sign in link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-secondary-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Trust indicators */}
      <div className="mt-6 pt-6 border-t border-secondary-200">
        <div className="flex items-center justify-center space-x-6 text-xs text-secondary-500">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-success-500 mr-1" />
            <span>Free Forever</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-success-500 mr-1" />
            <span>No Credit Card</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-success-500 mr-1" />
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
