import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

type LabelProps = TextProps & {
  disabled?: boolean;
};

export const Label = React.forwardRef<Text, LabelProps>(
  ({ style, disabled, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        style={[
          styles.label,
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569', // muted-foreground
    marginBottom: 4,
  },
  disabled: {
    opacity: 0.7,
  },
});
