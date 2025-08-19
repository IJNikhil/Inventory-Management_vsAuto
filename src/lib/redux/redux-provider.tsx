// src/lib/redux/redux-provider.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

interface ReduxProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Provider component that wraps the entire app with Redux store
 * Provides optimized store configuration for production use
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

export default ReduxProvider;

// import React from 'react';
// import { Provider } from 'react-redux';
// import { store } from './store';

// interface ReduxProviderProps {
//   children: React.ReactNode;
// }

// export function ReduxProvider({ children }: ReduxProviderProps) {
//   return <Provider store={store}>{children}</Provider>;
// }
