// import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

// export async function ensureWritePermission(): Promise<boolean> {
//   if (Platform.OS !== 'android') {
//     console.log('[Permissions] Not Android, permission automatically granted');
//     return true;
//   }

//   try {
//     if (Platform.Version >= 30) {
//       // Android 11+ (API 30+): MANAGE_EXTERNAL_STORAGE requires manual user grant in settings.
//       Alert.alert(
//         'Storage Permission Required',
//         'To save and share PDFs, please allow the "All Files Access" permission in your app settings.',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Open Settings',
//             onPress: () => Linking.openSettings(),
//           },
//         ],
//         { cancelable: false }
//       );
//       return false;
//     } else if (Platform.Version >= 23) {
//       // Android 6 to Android 10: request WRITE_EXTERNAL_STORAGE permission at runtime.
//       const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
//       console.log('[Permissions] Already has WRITE_EXTERNAL_STORAGE:', hasPermission);
//       if (hasPermission) {
//         return true;
//       }

//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//         {
//           title: 'Storage Permission',
//           message: 'App needs access to your storage to save PDF files',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         }
//       );
//       console.log('[Permissions] WRITE_EXTERNAL_STORAGE request result:', granted);

//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         return true;
//       } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
//         Alert.alert(
//           'Storage Permission Denied',
//           'You have permanently denied storage permission. Please enable it from the app settings to save and share PDFs.',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             {
//               text: 'Open Settings',
//               onPress: () => Linking.openSettings(),
//             },
//           ],
//           { cancelable: false }
//         );
//         return false;
//       } else {
//         return false;
//       }
//     } else {
//       // Android versions below 6 and others - permission automatically granted
//       return true;
//     }
//   } catch (err) {
//     console.warn('[Permissions] Permission request failed:', err);
//     return false;
//   }
// }


import { Platform } from 'react-native';

export async function ensureWritePermission(): Promise<boolean> {
  // For PDF sharing (not permanent saving), we don't need WRITE_EXTERNAL_STORAGE
  // We'll use the app's internal cache directory which doesn't require permissions
  
  if (Platform.OS !== 'android') {
    console.log('[Permissions] iOS - permission automatically granted');
    return true;
  }
  
  // For Android: Use internal cache directory - no permissions needed
  console.log('[Permissions] Android - using internal cache, no permissions required');
  return true;
}
