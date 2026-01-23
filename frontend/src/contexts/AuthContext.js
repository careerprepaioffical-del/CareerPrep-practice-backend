import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api, { wakeServer, __internal as apiInternal } from '../utils/api';

const safeJsonParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// Initial state
const initialState = {
  user: safeJsonParse(localStorage.getItem('user'), null),
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...(state.user || {}), ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const didInitRef = useRef(false);

  // Set token in localStorage and API headers
  const setToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      // React 18 StrictMode runs effects twice in development.
      if (didInitRef.current) return;
      didInitRef.current = true;

      const token = localStorage.getItem('token');
      const cachedUser = safeJsonParse(localStorage.getItem('user'), null);
      
      if (token) {
        try {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // If we have cached user data, unblock UI immediately, then refresh in background.
          if (cachedUser) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: cachedUser,
                token,
              },
            });
          } else {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          }

          // On backend cold start (Render), health check first
          // This prevents timeouts and gives backend time to spin up
          const isColdStart = !navigator.onLine || document.hidden;
          
          // Verify token and refresh user data (ensures roles/subscription are current)
          try {
            const response = await api.get('/auth/me');
            const freshUser = response?.data?.data?.user;
            if (freshUser) {
              localStorage.setItem('user', JSON.stringify(freshUser));
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: freshUser,
                  token,
                },
              });
            }
          } catch (verifyError) {
            // If auth/me fails due to cold start, retry with wake check
            if (apiInternal?.isColdStartLikeError?.(verifyError)) {
              console.log('Detected cold start, polling backend health...');
              const woke = await wakeServer({ maxWaitMs: 25000, attemptTimeoutMs: 8000 });
              
              if (woke) {
                // Retry token verification after backend is ready
                try {
                  const retryResponse = await api.get('/auth/me');
                  const freshUser = retryResponse?.data?.data?.user;
                  if (freshUser) {
                    localStorage.setItem('user', JSON.stringify(freshUser));
                    dispatch({
                      type: AUTH_ACTIONS.LOGIN_SUCCESS,
                      payload: {
                        user: freshUser,
                        token,
                      },
                    });
                  }
                } catch (retryError) {
                  // If retry still fails, use cached data
                  if (!cachedUser) {
                    setToken(null);
                    dispatch({ type: AUTH_ACTIONS.LOGOUT });
                  }
                }
              } else {
                // Backend never came online
                if (!cachedUser) {
                  setToken(null);
                  dispatch({ type: AUTH_ACTIONS.LOGOUT });
                }
              }
            } else {
              // Not a cold start error, token is genuinely invalid
              setToken(null);
              dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token is invalid, remove it
          setToken(null);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, [setToken]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await api.post(
        '/auth/login',
        { email, password },
        { skipNetworkToast: true }
      );
      const { user, token } = response.data.data;

      // Set token
      setToken(token);

      // Cache user for fast reloads / route transitions
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      // Render free tier / cold-start friendly handling
      const isColdStart = apiInternal?.isColdStartLikeError?.(error);

      if (isColdStart) {
        const toastId = 'waking-server';
        toast.loading('Server is starting (Render cold start)… retrying in a moment.', { id: toastId });

        const woke = await wakeServer({ maxWaitMs: 25000, attemptTimeoutMs: 8000 });
        if (woke) {
          try {
            const retryResponse = await api.post(
              '/auth/login',
              { email, password },
              { skipNetworkToast: true }
            );
            const { user, token } = retryResponse.data.data;

            setToken(token);
            localStorage.setItem('user', JSON.stringify(user));
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user, token },
            });

            toast.dismiss(toastId);
            toast.success('Login successful!');
            return { success: true };
          } catch (retryError) {
            toast.dismiss(toastId);
            const retryMessage =
              retryError.response?.data?.message ||
              'Server is still starting. Please try again in 10–20 seconds.';
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: retryMessage });
            toast.error(retryMessage);
            return { success: false, error: retryMessage };
          }
        }

        toast.dismiss(toastId);
        const wakeMessage = 'Server is still starting. Please try again in 10–20 seconds.';
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: wakeMessage });
        toast.error(wakeMessage);
        return { success: false, error: wakeMessage };
      }

      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [setToken]);

  // Register function
  const register = useCallback(async (name, email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await api.post('/auth/register', { name, email, password });
      const { user, token } = response.data.data;

      // Set token
      setToken(token);

      // Cache user for fast reloads / route transitions
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [setToken]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and state regardless of API call result
      setToken(null);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  }, [setToken]);

  // Update user function
  const updateUser = useCallback((userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!state.user && !!state.token;
  }, [state.user, state.token]);

  // Check if user has specific subscription plan
  const hasSubscription = useCallback((requiredPlan = 'premium') => {
    if (!state.user) return false;
    
    const planHierarchy = {
      'free': 0,
      'premium': 1,
      'pro': 2
    };

    const userPlanLevel = planHierarchy[state.user.subscription?.plan] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 1;

    return userPlanLevel >= requiredPlanLevel && state.user.subscription?.isActive;
  }, [state.user]);

  const value = useMemo(() => {
    return {
      // State
      user: state.user,
      token: state.token,
      loading: state.loading,
      error: state.error,

      // Actions
      login,
      register,
      logout,
      updateUser,
      clearError,

      // Utilities
      isAuthenticated,
      hasSubscription,
    };
  }, [
    clearError,
    hasSubscription,
    isAuthenticated,
    login,
    logout,
    register,
    state.error,
    state.loading,
    state.token,
    state.user,
    updateUser,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
