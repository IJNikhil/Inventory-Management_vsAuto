// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice';

// Production-ready store configuration with optimized settings
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Optimized serialization checks for better performance
        ignoredActions: [
          'auth/loginUser/fulfilled',
          'auth/initializeAuth/fulfilled',
          'persist/PERSIST',
          'persist/REHYDRATE'
        ],
        ignoredActionPaths: [
          'payload.timestamp',
          'payload.lastModified',
          'meta.arg.callback'
        ],
        ignoredPaths: [
          'auth.user.lastModified',
          'auth.lastLogin'
        ],
      },
      immutableCheck: process.env.NODE_ENV !== 'production',
      thunk: true,
    }),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: undefined,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export hooks for convenience
export { useAppDispatch, useAppSelector } from './hooks';

// Production logging
if (process.env.NODE_ENV !== 'production') {
  console.log('🚀 [Redux Store] Initialized successfully:', {
    reducers: Object.keys(store.getState()),
    middleware: 'Optimized for production',
    timestamp: new Date().toISOString()
  });
}

// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/auth-slice';

// // Advanced local-only store configuration
// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // Ultra-minimal serialization checks for local-only
//         ignoredActions: ['auth/loginUser/fulfilled', 'persist/PERSIST'],
//         ignoredActionPaths: ['payload.timestamp'],
//         ignoredPaths: ['auth.user.lastModified'],
//       },
//       immutableCheck: __DEV__, // Only in development
//     }),
//   devTools: __DEV__, // Only in development
//   // Advanced: Preloaded state for faster hydration
//   preloadedState: undefined,
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// // Re-export hooks for convenience
// export { useAppDispatch, useAppSelector } from './hooks';

// // Advanced: Store enhancement for local operations
// if (__DEV__) {
//   console.log('🚀 [Local Store] Initialized:', {
//     reducers: Object.keys(store.getState()),
//     timestamp: new Date().toISOString()
//   });
// }
