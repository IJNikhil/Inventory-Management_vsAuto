import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  iconStyle?: ViewStyle | ViewStyle[];
};

export const Checkbox = ({
  checked,
  onCheckedChange,
  disabled,
  style,
  iconStyle,
}: CheckboxProps) => {
  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      style={[
        styles.root,
        checked && styles.checked,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      {checked && (
        <View style={[styles.iconWrap, iconStyle]}>
          <Check size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#0d9488', // primary
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 0,
  },
  checked: {
    backgroundColor: '#0d9488', // primary
    borderColor: '#0d9488',
  },
  disabled: {
    opacity: 0.5,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
