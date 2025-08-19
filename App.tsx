// App.tsx
import 'react-native-get-random-values'; // ✅ MUST be the very first import to fix UUID error

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ReduxProvider } from './src/lib/redux/redux-provider';
import { useAppDispatch } from './src/lib/redux/hooks';
import { initializeAuth } from './src/lib/redux/slices/auth-slice';
import { initializeDatabase } from './src/lib/database/connection';

function RootApp() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize local database first
        await initializeDatabase();
        console.log('✅ Local database initialized');
        
        // Initialize authentication (restore session)
        await dispatch(initializeAuth()).unwrap();
        console.log('✅ Auth initialized');
        
      } catch (error) {
        console.error('❌ App initialization error:', error);
      }
    };
    
    initializeApp();
  }, [dispatch]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <NavigationContainer>
              <RootApp />
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}



// import React, { useEffect } from 'react';
// import { StatusBar } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { ThemeProvider } from './src/context/ThemeContext';
// import AppNavigator from './src/navigation/AppNavigator';
// import { ReduxProvider } from './src/lib/redux/redux-provider';
// import { useAppDispatch } from './src/lib/redux/hooks';
// import { authActions } from './src/lib/redux/slices/auth-slice';
// import { initializeDatabase } from './src/lib/localDb';

// function RootApp() {
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         // Initialize local database
//         await initializeDatabase();
//         console.log('✅ Local database initialized');
        
//         // Initialize authentication (restore session)
//         dispatch(authActions.initialize());
//         console.log('✅ Auth initialized');
        
//       } catch (error) {
//         console.error('❌ App initialization error:', error);
//       }
//     };
    
//     initializeApp();
//   }, [dispatch]);

//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <AppNavigator />
//     </>
//   );
// }

// export default function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ReduxProvider>
//         <SafeAreaProvider>
//           <ThemeProvider>
//             <NavigationContainer>
//               <RootApp />
//             </NavigationContainer>
//           </ThemeProvider>
//         </SafeAreaProvider>
//       </ReduxProvider>
//     </GestureHandlerRootView>
//   );
// }
