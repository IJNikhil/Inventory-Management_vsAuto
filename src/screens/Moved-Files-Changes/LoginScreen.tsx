// // src/screens/LoginScreen.tsx

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   StyleSheet,
//   ScrollView,
//   InteractionManager,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Wrench, Eye, EyeOff } from 'lucide-react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useAppDispatch, useAppSelector } from '../lib/redux/hooks';
// import { loginUser, selectAuth } from '../lib/redux/slices/auth-slice';
// import { useColors, useTheme } from '../context/ThemeContext';

// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../navigation/AppNavigator';

// type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;


// export default function LoginPage() {
//   const dispatch = useAppDispatch();
//   const { user, loading = false, error } = useAppSelector(selectAuth);
//   const navigation = useNavigation<LoginScreenNavigationProp>();

//   const colors = useColors();
//   const { isDark } = useTheme();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [localError, setLocalError] = useState<string | null>(null);

//   // Local flag to prevent multiple login attempts
//   const [isLoggingIn, setIsLoggingIn] = useState(false);

//   // Redirect to MainApp once user logged in and not loading
//   useEffect(() => {
//     if (user && !loading) {
//       InteractionManager.runAfterInteractions(() => {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'MainApp' }],
//         });
//       });
//     }
//   }, [user, loading, navigation]);

//   // Sync Redux error to local error for display
//   useEffect(() => {
//     setLocalError(error || null);
//   }, [error]);

//   const handleLogin = async () => {
//     if (isLoggingIn || loading) return; // Prevent multiple clicks

//     setLocalError(null);

//     if (!email.trim() || !password) {
//       setLocalError('Please enter your email and password.');
//       return;
//     }

//     setIsLoggingIn(true);
//     try {
//       await dispatch(loginUser({ email: email.trim(), password })).unwrap();
//     } catch (err) {
//       setLocalError(typeof err === 'string' ? err : 'Login failed. Please try again.');
//     } finally {
//       setIsLoggingIn(false);
//     }
//   };

//   const dynamicStyles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: colors.background },
//     formCard: {
//       backgroundColor: colors.card,
//       shadowColor: isDark ? colors.foreground : '#000',
//     },
//     logoWrap: { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' },
//     heading: { color: colors.foreground },
//     subheading: { color: colors.mutedForeground },
//     label: { color: colors.foreground },
//     textInput: { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground },
//     errorContainer: { backgroundColor: colors.destructive + '20' },
//     errorMsg: { color: colors.destructive },
//     loginBtnActive: { backgroundColor: colors.primary },
//     loginBtnDisabled: { backgroundColor: colors.muted, opacity: 0.6 },
//     loginBtnText: { color: colors.primaryForeground },
//     demoContainer: { backgroundColor: colors.accent + '20', borderLeftColor: colors.accent },
//     demoTitle: { color: colors.foreground },
//     demoText: { color: colors.mutedForeground },
//   });

//   return (
//     <SafeAreaView style={dynamicStyles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 32 : 0}
//       >
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.centerContainer}>
//             <View style={[styles.formCard, dynamicStyles.formCard]}>
//               <View style={styles.header}>
//                 <View style={[styles.logoWrap, dynamicStyles.logoWrap]}>
//                   <Wrench size={32} color={colors.primary} />
//                 </View>
//                 <Text style={[styles.heading, dynamicStyles.heading]}>Welcome Back</Text>
//                 <Text style={[styles.subheading, dynamicStyles.subheading]}>
//                   Enter your credentials to access your VS Auto Store account.
//                 </Text>
//               </View>

//               <View style={styles.formContainer}>
//                 <View style={styles.formItem}>
//                   <Text style={[styles.label, dynamicStyles.label]}>
//                     Email <Text style={styles.required}>*</Text>
//                   </Text>
//                   <TextInput
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                     placeholder="admin@example.com"
//                     placeholderTextColor={colors.mutedForeground}
//                     value={email}
//                     onChangeText={setEmail}
//                     style={[styles.textInput, dynamicStyles.textInput]}
//                     autoCorrect={false}
//                     returnKeyType="next"
//                     editable={!loading && !isLoggingIn}
//                     selectionColor={colors.primary}
//                     onSubmitEditing={() => {
//                       // Focus password input if needed
//                     }}
//                   />
//                 </View>

//                 <View style={styles.formItem}>
//                   <Text style={[styles.label, dynamicStyles.label]}>
//                     Password <Text style={styles.required}>*</Text>
//                   </Text>
//                   <View style={styles.passwordInputWrap}>
//                     <TextInput
//                       secureTextEntry={!showPassword}
//                       placeholder="password"
//                       placeholderTextColor={colors.mutedForeground}
//                       value={password}
//                       onChangeText={setPassword}
//                       style={[styles.textInput, styles.passwordInput, dynamicStyles.textInput]}
//                       autoCorrect={false}
//                       returnKeyType="done"
//                       editable={!loading && !isLoggingIn}
//                       selectionColor={colors.primary}
//                       onSubmitEditing={handleLogin}
//                     />
//                     <TouchableOpacity
//                       onPress={() => setShowPassword((v) => !v)}
//                       style={styles.eyeIconBtn}
//                       accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
//                       disabled={loading || isLoggingIn}
//                       activeOpacity={0.7}
//                     >
//                       {showPassword ? (
//                         <EyeOff size={22} color={colors.mutedForeground} />
//                       ) : (
//                         <Eye size={22} color={colors.mutedForeground} />
//                       )}
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {localError && (
//                   <View style={[styles.errorContainer, dynamicStyles.errorContainer]}>
//                     <Text style={[styles.errorMsg, dynamicStyles.errorMsg]}>{localError}</Text>
//                   </View>
//                 )}

//                 <TouchableOpacity
//                   onPress={handleLogin}
//                   disabled={loading || isLoggingIn}
//                   style={[
//                     styles.loginBtn,
//                     loading || isLoggingIn
//                       ? [styles.loginBtnDisabled, dynamicStyles.loginBtnDisabled]
//                       : [styles.loginBtnActive, dynamicStyles.loginBtnActive],
//                   ]}
//                   activeOpacity={loading || isLoggingIn ? 1 : 0.8}
//                 >
//                   {(loading || isLoggingIn) && (
//                     <ActivityIndicator size="small" color={colors.primaryForeground} style={{ marginRight: 8 }} />
//                   )}
//                   <Text style={[styles.loginBtnText, dynamicStyles.loginBtnText]}>
//                     {loading || isLoggingIn ? 'Signing in...' : 'Login'}
//                   </Text>
//                 </TouchableOpacity>

//                 <View style={[styles.demoContainer, dynamicStyles.demoContainer]}>
//                   <Text style={[styles.demoTitle, dynamicStyles.demoTitle]}>Demo Credentials:</Text>
//                   <Text style={[styles.demoText, dynamicStyles.demoText]}>Email: admin@example.com</Text>
//                   <Text style={[styles.demoText, dynamicStyles.demoText]}>Password: password</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//           <View style={{ height: 24 }} />
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     minHeight: '100%',
//     paddingVertical: 24,
//   },
//   centerContainer: {
//     width: '100%',
//     maxWidth: 400,
//     alignSelf: 'center',
//     padding: 16,
//   },
//   formCard: {
//     borderRadius: 18,
//     padding: 24,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   logoWrap: {
//     padding: 12,
//     borderWidth: 3,
//     borderRadius: 999,
//     marginBottom: 16,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   subheading: {
//     textAlign: 'center',
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   formContainer: {
//     gap: 4,
//   },
//   formItem: {
//     marginBottom: 20,
//   },
//   label: {
//     marginBottom: 8,
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   required: {
//     color: '#dc2626',
//     marginLeft: 2,
//     fontWeight: '700',
//   },
//   textInput: {
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     minHeight: 50,
//   },
//   passwordInputWrap: {
//     position: 'relative',
//     justifyContent: 'center',
//   },
//   passwordInput: {
//     paddingRight: 50,
//   },
//   eyeIconBtn: {
//     position: 'absolute',
//     right: 12,
//     top: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '100%',
//     width: 40,
//     zIndex: 5,
//   },
//   errorContainer: {
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 16,
//     marginTop: -8,
//   },
//   errorMsg: {
//     fontSize: 14,
//     textAlign: 'center',
//     fontWeight: '500',
//     lineHeight: 18,
//   },
//   loginBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     borderRadius: 12,
//     marginTop: 8,
//     minHeight: 54,
//   },
//   loginBtnActive: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   loginBtnDisabled: {
//     opacity: 0.6,
//   },
//   loginBtnText: {
//     fontWeight: '700',
//     fontSize: 16,
//   },
//   demoContainer: {
//     marginTop: 28,
//     padding: 16,
//     borderRadius: 10,
//     borderLeftWidth: 4,
//   },
//   demoTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   demoText: {
//     fontSize: 13,
//     marginBottom: 2,
//     fontWeight: '500',
//   },
// });
