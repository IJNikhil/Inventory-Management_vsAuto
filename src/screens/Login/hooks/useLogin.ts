import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../lib/redux/hooks';
import { authActions, selectAuth, clearError } from '../../../lib/redux/slices/auth-slice';

export function useLogin() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector(selectAuth);

  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (localError && password) {
      setLocalError(null);
      if (error) {
        dispatch(clearError());
      }
    }
  }, [password, localError, error, dispatch]);

  const validateForm = (): string | null => {
    if (!password) {
      return 'Please enter your password.';
    }
    if (password.length < 4) {
      return 'Password must be at least 4 characters.';
    }
    return null;
  };

  const handleLogin = async () => {
    if (isLoggingIn || isLoading) return;

    // Clear any existing errors
    setLocalError(null);
    dispatch(clearError());

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setIsLoggingIn(true);
    try {
      // ✅ FIXED: Remove .unwrap() call
      await dispatch(authActions.login(password));
      
      // The auth slice will handle success/failure via Redux state
      // No need for try/catch since errors are handled in the slice
    } catch (err) {
      // This catch block may not be needed since your thunk doesn't throw
      console.error('Login dispatch error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resetForm = () => {
    setPassword('');
    setLocalError(null);
    dispatch(clearError());
  };

  return {
    password,
    setPassword,
    localError,
    isLoggingIn: isLoggingIn || isLoading,
    isAuthenticated,
    handleLogin,
    resetForm,
    isFormValid: !validateForm(),
  };
}
