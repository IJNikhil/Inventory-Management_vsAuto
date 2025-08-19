import React from 'react'
import { TextInput, TextInputProps, StyleSheet, StyleProp, TextStyle } from 'react-native'

interface TextareaProps extends Omit<TextInputProps, 'editable'> {
  style?: StyleProp<TextStyle>
  disabled?: boolean
}

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    {
      style,
      multiline = true,
      numberOfLines = 4,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <TextInput
        ref={ref}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.textarea,
          disabled && styles.disabled,
          style,
        ]}
        textAlignVertical="top"
        editable={!disabled}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

const styles = StyleSheet.create({
  textarea: {
    width: '100%',
    minHeight: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    color: '#18181b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
})
