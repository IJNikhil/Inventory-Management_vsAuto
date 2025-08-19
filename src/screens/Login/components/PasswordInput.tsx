// PasswordInput.tsx - Enhanced with better accessibility and error states
import React, { useState, forwardRef, useRef } from 'react';
import { TextInput, TouchableOpacity, View, StyleSheet, Animated, Platform } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useColors } from '../../../context/ThemeContext';

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
    },
    ref
  ) => {
    const colors = useColors();
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleTogglePassword = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
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
      <View style={[styles.container, style, isFocused && styles.containerFocused]}>
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
          style={[
            styles.input, 
            { 
              borderColor: getBorderColor(),
              color: colors.foreground,
              backgroundColor: colors.background,
            }
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel || 'Password input field'}
          textContentType="password"
          autoComplete="password"
          testID={testID}
        />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handleTogglePassword}
            style={[styles.eyeIconBtn, { opacity: editable ? 1 : 0.6 }]}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            activeOpacity={0.7}
            disabled={!editable}
            testID={testID ? `${testID}-toggle` : 'password-toggle'}
          >
            {showPassword ? (
              <EyeOff size={24} color={getIconColor()} />
            ) : (
              <Eye size={24} color={getIconColor()} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    borderRadius: 12,
  },
  containerFocused: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 52,
    paddingRight: 52,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  eyeIconBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: '100%',
  },
});

export default PasswordInput;
