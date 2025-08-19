import React, { useState, useEffect, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  InteractionManager,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wrench, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useColors, useTheme } from '../../context/ThemeContext';
import { useLogin } from './hooks/useLogin';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// ✅ UPDATED: Simplified PasswordInput Component
type PasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  returnKeyType?: 'done' | 'next' | 'default' | 'go' | 'search' | 'send';
  onSubmitEditing?: () => void;
  placeholderTextColor?: string;
  selectionColor?: string;
  style?: any;
  accessibilityLabel?: string;
  error?: boolean;
  testID?: string;
  colors?: any;
};

const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  (
    {
      value,
      onChangeText,
      placeholder = 'Enter password',
      editable = true,
      returnKeyType = 'done',
      onSubmitEditing,
      placeholderTextColor,
      selectionColor,
      style,
      accessibilityLabel,
      error = false,
      testID,
      colors: passedColors,
    },
    ref
  ) => {
    const colors = passedColors || useColors();
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleTogglePassword = () => {
      setShowPassword(prev => !prev);
    };

    const getBorderColor = () => {
      if (error) return colors.destructive;
      if (isFocused) return colors.primary;
      return colors.border;
    };

    const getIconColor = () => {
      if (error) return colors.destructive;
      if (isFocused) return colors.primary;
      return colors.mutedForeground;
    };

    return (
      <View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: colors.background,
        paddingHorizontal: 12,
        minHeight: 44,
        borderColor: getBorderColor(),
      }, style]}>
        <View style={{ marginRight: 10 }}>
          <Lock size={18} color={colors.mutedForeground} />
        </View>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || colors.mutedForeground}
          secureTextEntry={!showPassword}
          editable={editable}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          selectionColor={selectionColor || colors.primary}
          style={{
            flex: 1,
            fontSize: 16,
            paddingVertical: 8,
            color: colors.foreground,
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel || 'Password input field'}
          textContentType="password"
          autoComplete="password"
          testID={testID}
        />
        <TouchableOpacity
          onPress={handleTogglePassword}
          style={{
            padding: 6,
            marginLeft: 6,
            opacity: editable ? 1 : 0.6,
          }}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
          activeOpacity={0.7}
          disabled={!editable}
          testID={testID ? `${testID}-toggle` : 'password-toggle'}
        >
          {showPassword ? (
            <EyeOff size={18} color={getIconColor()} />
          ) : (
            <Eye size={18} color={getIconColor()} />
          )}
        </TouchableOpacity>
      </View>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// ✅ UPDATED: Main LoginScreen Component - Password Only
export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const colors = useColors();
  const { isDark } = useTheme();

  // ✅ FIXED: Only destructure properties that exist in useLogin
  const {
    password,
    setPassword,
    localError,
    isLoggingIn,
    isAuthenticated, // ✅ FIXED: Use isAuthenticated instead of user
    handleLogin,
    isFormValid,
  } = useLogin();

  // ✅ FIXED: Use isAuthenticated instead of user for navigation
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     InteractionManager.runAfterInteractions(() => {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: 'MainApp' }],
  //       });
  //     });
  //   }
  // }, [isAuthenticated, navigation]);

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Main Card */}
              <View style={styles.loginCard}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <Wrench size={28} color={colors.primary} strokeWidth={2} />
                  </View>
                  
                  <Text style={[styles.title, { color: colors.foreground }]}>
                    VS Auto HQ
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                    Enter your password to continue
                  </Text>
                </View>

                {/* ✅ UPDATED: Form - Password Only */}
                <View style={styles.form}>
                  {/* ❌ REMOVED: Email Input - Not needed for local auth */}
                  
                  {/* Password Input */}
                  <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                      Password
                    </Text>
                    <PasswordInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      editable={!isLoggingIn}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      placeholderTextColor={colors.mutedForeground}
                      selectionColor={colors.primary}
                      accessibilityLabel="Password input"
                      error={!!localError}
                      colors={colors}
                      testID="password-input"
                    />
                  </View>

                  {/* Error Message */}
                  {localError && (
                    <View style={[styles.errorContainer, { backgroundColor: colors.destructive + '15' }]}>
                      <Text style={[styles.errorText, { color: colors.destructive }]}>
                        {localError}
                      </Text>
                    </View>
                  )}

                  {/* Login Button */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoggingIn || !isFormValid}
                    style={[
                      styles.loginButton,
                      {
                        backgroundColor: isLoggingIn || !isFormValid 
                          ? colors.muted 
                          : colors.primary,
                        opacity: isLoggingIn || !isFormValid ? 0.7 : 1,
                      }
                    ]}
                    activeOpacity={0.8}
                    testID="login-button"
                  >
                    {isLoggingIn && (
                      <ActivityIndicator 
                        size="small" 
                        color={colors.primaryForeground} 
                        style={styles.loadingIndicator} 
                      />
                    )}
                    <Text style={[styles.loginButtonText, { color: colors.primaryForeground }]}>
                      {isLoggingIn ? 'Signing In...' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ✅ ADDED: Password hint for first-time users */}
                <View style={styles.hintContainer}>
                  <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
                    First time? Enter any password (minimum 4 characters)
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    container: {
      width: '100%',
      maxWidth: 380,
      alignSelf: 'center',
    },
    loginCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.15 : 0.05,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    logoContainer: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.primary + '10',
      borderRadius: 50,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      textAlign: 'center',
      opacity: 0.8,
    },
    form: {
      marginBottom: 16,
    },
    fieldGroup: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
    },
    errorContainer: {
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
      marginTop: -4,
    },
    errorText: {
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
    },
    loginButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 6,
      minHeight: 48,
      marginTop: 8,
    },
    loadingIndicator: {
      marginRight: 8,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },
    hintContainer: {
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    hintText: {
      fontSize: 12,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });
