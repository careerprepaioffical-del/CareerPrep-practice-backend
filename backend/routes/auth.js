const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');
const Progress = require('../models/Progress');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { sendSignupOtpEmail, sendPasswordResetOtpEmail } = require('../services/emailService');
const { markLoginActivityAndStreak } = require('../services/streakService');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Passport Google OAuth2 strategy (redirect / authorization-code flow)
const setupGooglePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:5000/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn(
      '⚠️  Google OAuth redirect flow not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET).'
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) return done(new Error('No email in Google profile'));

          let user = await User.findOne({ email });
          if (!user) {
            user = new User({
              name: profile?.displayName || email.split('@')[0],
              email,
              avatar: profile?.photos?.[0]?.value || null,
              authProvider: 'google',
              googleId: profile?.id || null,
              isEmailVerified: true,
            });
            await user.save();
            const progress = new Progress({ userId: user._id });
            await progress.save();
          } else {
            const updates = {};
            if (!user.googleId && profile?.id) updates.googleId = profile.id;
            if (!user.avatar && profile?.photos?.[0]?.value)
              updates.avatar = profile.photos[0].value;
            if (!user.isEmailVerified) updates.isEmailVerified = true;
            if (Object.keys(updates).length > 0)
              await User.updateOne({ _id: user._id }, { $set: updates });
          }

          markLoginActivityAndStreak(user._id).catch((e) => {
            console.error('Failed to update login activity/streak:', e);
          });

          const token = generateToken(user._id);
          return done(null, { token });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((data, done) => done(null, data));
  passport.deserializeUser((data, done) => done(null, data));
};

setupGooglePassport();


// Validation middleware
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ,
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .matches(/^\d{6}$/)
    .withMessage('OTP must be a 6 digit code')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateOtpRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const validateGoogleAuth = [
  body('idToken')
    .notEmpty()
    .withMessage('idToken is required')
];

const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .matches(/^\d{6}$/)
    .withMessage('OTP must be a 6 digit code'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

const OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10);
const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10);

const getOtpHash = ({ email, otp }) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'otp-secret';
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const normalizedOtp = String(otp || '').trim();
  return crypto
    .createHash('sha256')
    .update(`${normalizedEmail}:${normalizedOtp}:${secret}`)
    .digest('hex');
};

const safeEqualHex = (a, b) => {
  try {
    const bufA = Buffer.from(String(a || ''), 'hex');
    const bufB = Buffer.from(String(b || ''), 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
};

// @route   POST /api/auth/request-otp
// @desc    Request OTP for signup (sent via Brevo SMTP)
// @access  Public
router.post('/request-otp', validateOtpRequest, handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const now = new Date();
    const cooldownSince = new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000);

    const recent = await EmailOtp.findOne({
      email,
      purpose: 'signup',
      createdAt: { $gte: cooldownSince },
      expiresAt: { $gt: now }
    }).sort({ createdAt: -1 });

    if (recent) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting a new OTP.`
      });
    }

    // Invalidate older OTPs for this email/purpose
    await EmailOtp.deleteMany({ email, purpose: 'signup' });

    const otpCode = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const otpHash = getOtpHash({ email, otp: otpCode });
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email,
      purpose: 'signup',
      otpHash,
      expiresAt,
      attempts: 0
    });

    await sendSignupOtpEmail({
      toEmail: email,
      otpCode,
      expiresInMinutes: OTP_EXPIRES_MINUTES,
    });

    return res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/request-password-reset-otp
// @desc    Request OTP for forgot password
// @access  Public
router.post('/request-password-reset-otp', validateOtpRequest, handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+password');

    // Do not reveal if account exists. Return success for unknown emails.
    if (!user) {
      return res.json({
        success: true,
        message: 'If this email is registered, an OTP has been sent.'
      });
    }

    if (user.authProvider && user.authProvider !== 'local') {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please continue with Google.'
      });
    }

    const now = new Date();
    const cooldownSince = new Date(Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000);

    const recent = await EmailOtp.findOne({
      email,
      purpose: 'password_reset',
      createdAt: { $gte: cooldownSince },
      expiresAt: { $gt: now }
    }).sort({ createdAt: -1 });

    if (recent) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting a new OTP.`
      });
    }

    await EmailOtp.deleteMany({ email, purpose: 'password_reset' });

    const otpCode = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const otpHash = getOtpHash({ email, otp: otpCode });
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

    await EmailOtp.create({
      email,
      purpose: 'password_reset',
      otpHash,
      expiresAt,
      attempts: 0
    });

    await sendPasswordResetOtpEmail({
      toEmail: email,
      otpCode,
      expiresInMinutes: OTP_EXPIRES_MINUTES,
    });

    return res.json({
      success: true,
      message: 'If this email is registered, an OTP has been sent.'
    });
  } catch (error) {
    console.error('Request password reset OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using email OTP
// @access  Public
router.post('/reset-password', validatePasswordReset, handleValidationErrors, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or email'
      });
    }

    if (user.authProvider && user.authProvider !== 'local') {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please continue with Google.'
      });
    }

    const otpRecord = await EmailOtp.findOne({ email, purpose: 'password_reset' }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.'
      });
    }

    if (otpRecord.expiresAt <= new Date()) {
      await EmailOtp.deleteMany({ email, purpose: 'password_reset' });
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.'
      });
    }

    if (otpRecord.attempts >= 5) {
      await EmailOtp.deleteMany({ email, purpose: 'password_reset' });
      return res.status(429).json({
        success: false,
        message: 'Too many OTP attempts. Please request a new OTP.'
      });
    }

    const candidateHash = getOtpHash({ email, otp });
    const ok = safeEqualHex(candidateHash, otpRecord.otpHash);
    if (!ok) {
      await EmailOtp.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    user.password = newPassword;
    await user.save();

    await EmailOtp.deleteMany({ email, purpose: 'password_reset' });

    return res.json({
      success: true,
      message: 'Password reset successful. Please sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth redirect flow
// @access  Public
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Handle Google OAuth callback, issue JWT, redirect to frontend
// @access  Public
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`,
    })(req, res, next);
  },
  (req, res) => {
    const token = req.user?.token;
    if (!token) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`);
  }
);

// @route   POST /api/auth/google
// @desc    Login/Register user using Google ID token (popup / mobile flow)
// @access  Public
router.post('/google', validateGoogleAuth, handleValidationErrors, async (req, res) => {
  try {
    const { idToken } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: 'Google auth is not configured on the server'
      });
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    const email = payload?.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google token did not include an email'
      });
    }

    let user = await User.findOne({ email }).select('-password');

    if (!user) {
      user = new User({
        name: payload?.name || email.split('@')[0],
        email,
        avatar: payload?.picture || null,
        authProvider: 'google',
        googleId: payload?.sub || null,
        isEmailVerified: payload?.email_verified === true
      });

      await user.save();

      const progress = new Progress({ userId: user._id });
      await progress.save();
    } else {
      // Optionally link Google id for existing accounts
      const updates = {};
      if (!user.googleId && payload?.sub) updates.googleId = payload.sub;
      if (!user.avatar && payload?.picture) updates.avatar = payload.picture;
      if (payload?.email_verified === true && !user.isEmailVerified) updates.isEmailVerified = true;
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
      }
    }

    await markLoginActivityAndStreak(user._id);

    const token = generateToken(user._id);
    const freshUser = await User.findById(user._id).select('-password');

    return res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user: freshUser.toJSON(),
        token,
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const otpRecord = await EmailOtp.findOne({ email, purpose: 'signup' }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP.'
      });
    }

    if (otpRecord.expiresAt <= new Date()) {
      await EmailOtp.deleteMany({ email, purpose: 'signup' });
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.'
      });
    }

    // Basic attempt limiting
    if (otpRecord.attempts >= 5) {
      await EmailOtp.deleteMany({ email, purpose: 'signup' });
      return res.status(429).json({
        success: false,
        message: 'Too many OTP attempts. Please request a new OTP.'
      });
    }

    const candidateHash = getOtpHash({ email, otp });
    const ok = safeEqualHex(candidateHash, otpRecord.otpHash);
    if (!ok) {
      await EmailOtp.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      authProvider: 'local',
      isEmailVerified: true
    });

    await user.save();

    // Consume OTP
    await EmailOtp.deleteMany({ email, purpose: 'signup' });

    // Create progress record for the user
    const progress = new Progress({
      userId: user._id
    });
    await progress.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.authProvider && user.authProvider !== 'local') {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please continue with Google.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    await markLoginActivityAndStreak(user._id);

    // Generate token
    const token = generateToken(user._id);

    // Return fresh user state so response includes latest streak updates.
    const freshUser = await User.findById(user._id).select('-password');
    const userResponse = freshUser ? freshUser.toJSON() : user.toJSON();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Get user's progress data
    const progress = await Progress.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        progress: progress || null
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. Here we can log the logout event.
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.post('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user.toJSON()
    }
  });
});

module.exports = router;
