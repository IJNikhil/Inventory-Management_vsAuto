import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

export const Input = React.forwardRef<TextInput, TextInputProps>(
  ({ style, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        style={[
          styles.input,
          style, // allow extra styles via prop, merged last
        ]}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#000', // Replace with your foreground if themed
  },
});
