// src/lib/redux/slices/auth-slice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../../types/database';
import { userService } from '../../../services/user-service';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  isInitialized: false,
};

// Enhanced authentication manager
class AuthManager {
  private static readonly PWD_KEY = 'app_password';
  private static readonly SESSION_KEY = 'auth_session';
  private static readonly USER_KEY = 'current_user';

  static async login(password: string): Promise<{ success: boolean; user?: User }> {
    try {
      const storedPassword = await AsyncStorage.getItem(this.PWD_KEY);
      
      // First time login - set password if it's valid
      if (!storedPassword) {
        if (password.length >= 4) {
          await AsyncStorage.setItem(this.PWD_KEY, password);
          await AsyncStorage.setItem(this.SESSION_KEY, 'authenticated');
          
          const user = await userService.getCurrentUser();
          if (user) {
            await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
            return { success: true, user };
          }
        }
        return { success: false };
      }

      // Existing password check
      if (storedPassword === password) {
        await AsyncStorage.setItem(this.SESSION_KEY, 'authenticated');
        
        const user = await userService.getCurrentUser();
        if (user) {
          await userService.updateLastLogin(user.id);
          await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
          return { success: true, user };
        }
      }

      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  }

  static async logout(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.SESSION_KEY),
        AsyncStorage.removeItem(this.USER_KEY)
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async isLoggedIn(): Promise<boolean> {
    try {
      const session = await AsyncStorage.getItem(this.SESSION_KEY);
      return session === 'authenticated';
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }

      // Fallback to database
      const user = await userService.getCurrentUser();
      if (user) {
        await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const storedPassword = await AsyncStorage.getItem(this.PWD_KEY);
      
      if (storedPassword === oldPassword && newPassword.length >= 4) {
        await AsyncStorage.setItem(this.PWD_KEY, newPassword);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  static async hasPassword(): Promise<boolean> {
    try {
      const storedPassword = await AsyncStorage.getItem(this.PWD_KEY);
      return !!storedPassword;
    } catch (error) {
      console.error('Check password error:', error);
      return false;
    }
  }
}

// Async thunks for authentication actions
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const [isLoggedIn, user] = await Promise.all([
        AuthManager.isLoggedIn(),
        AuthManager.getCurrentUser()
      ]);

      return {
        isAuthenticated: isLoggedIn,
        user: isLoggedIn ? user : null
      };
    } catch (error) {
      return rejectWithValue('Failed to initialize authentication');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (password: string, { rejectWithValue }) => {
    try {
      const result = await AuthManager.login(password);
      
      if (result.success && result.user) {
        return result.user;
      } else {
        return rejectWithValue('Invalid password');
      }
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthManager.logout();
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const success = await AuthManager.changePassword(oldPassword, newPassword);
      
      if (success) {
        return { success: true };
      } else {
        return rejectWithValue('Invalid old password or new password too short');
      }
    } catch (error) {
      return rejectWithValue('Failed to change password');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    updates: { name?: string; email?: string; phone?: string; avatar?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        return rejectWithValue('No user logged in');
      }

      const updatedUser = await userService.updateProfile(currentUser.id, updates);
      
      if (updatedUser) {
        // Update stored user data
        await AsyncStorage.setItem(AuthManager['USER_KEY'], JSON.stringify(updatedUser));
        return updatedUser;
      } else {
        return rejectWithValue('Failed to update profile');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and selectors
export const { clearError, setUser, clearUser } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;

// Export auth actions for backward compatibility
export const authActions = {
  initialize: initializeAuth,
  login: loginUser,
  logout: logoutUser,
  changePassword: changePassword,
  updateProfile: updateUserProfile
};

// Export auth manager for direct use if needed
export { AuthManager };

export default authSlice.reducer;


// // src/lib/redux/slices/auth-slice.ts

// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface LocalUser {
//   name: string;
// }

// interface AuthState {
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
//   user: LocalUser | null;
// }

// const initialState: AuthState = {
//   isAuthenticated: false,
//   isLoading: false,
//   error: null,
//   user: { name: 'Owner' }, // Single-user local mode
// };

// class SimpleAuth {
//   private static readonly pwdKey = 'pwd';
//   private static readonly sessionKey = 'auth';

//   static async login(password: string): Promise<boolean> {
//     const stored = await AsyncStorage.getItem(this.pwdKey);
//     const valid = stored ? stored === password : password.length >= 4;
//     if (valid) {
//       if (!stored) await AsyncStorage.setItem(this.pwdKey, password);
//       await AsyncStorage.setItem(this.sessionKey, '1');
//     }
//     return valid;
//   }

//   static async logout() {
//     await AsyncStorage.removeItem(this.sessionKey);
//   }

//   static async isLoggedIn() {
//     return (await AsyncStorage.getItem(this.sessionKey)) === '1';
//   }

//   static async changePassword(oldPwd: string, newPwd: string) {
//     if (await this.login(oldPwd) && newPwd.length >= 4) {
//       await AsyncStorage.setItem(this.pwdKey, newPwd);
//       return true;
//     }
//     return false;
//   }
// }

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     loginStart: (s) => {
//       s.isLoading = true;
//       s.error = null;
//     },
//     loginSuccess: (s, a: PayloadAction<LocalUser | undefined>) => {
//       s.isAuthenticated = true;
//       s.isLoading = false;
//       s.error = null;
//       if (a.payload) s.user = a.payload;
//     },
//     loginFail: (s, a: PayloadAction<string>) => {
//       s.isAuthenticated = false;
//       s.isLoading = false;
//       s.error = a.payload;
//     },
//     logout: (s) => {
//       s.isAuthenticated = false;
//       s.user = initialState.user;
//     },
//     clearError: (s) => {
//       s.error = null;
//     },
//   },
// });

// /**
//  * Selector for accessing the auth slice
//  */
// export const selectAuth = (state: { auth: AuthState }) => state.auth;

// /**
//  * Async thunk-like actions
//  */
// export const authActions = {
//   login: (password: string) => async (dispatch: any) => {
//     dispatch(authSlice.actions.loginStart());
//     try {
//       const valid = await SimpleAuth.login(password);
//       dispatch(
//         valid
//           ? authSlice.actions.loginSuccess({ name: 'Owner' })
//           : authSlice.actions.loginFail('Invalid password')
//       );
//     } catch {
//       dispatch(authSlice.actions.loginFail('Login failed'));
//     }
//   },

//   logout: () => async (dispatch: any) => {
//     await SimpleAuth.logout();
//     dispatch(authSlice.actions.logout());
//   },

//   initialize: () => async (dispatch: any) => {
//     const loggedIn = await SimpleAuth.isLoggedIn();
//     if (loggedIn) {
//       dispatch(authSlice.actions.loginSuccess({ name: 'Owner' }));
//     }
//   },

//   changePassword: (oldPwd: string, newPwd: string) => async (dispatch: any) => {
//     dispatch(authSlice.actions.loginStart());
//     const changed = await SimpleAuth.changePassword(oldPwd, newPwd);
//     dispatch(
//       changed
//         ? authSlice.actions.loginSuccess({ name: 'Owner' })
//         : authSlice.actions.loginFail('Password change failed')
//     );
//   },
// };

// /**
//  * Export the reducer actions we want to use directly, including loginSuccess
//  */
// export const { clearError, loginSuccess } = authSlice.actions;

// export default authSlice.reducer;
