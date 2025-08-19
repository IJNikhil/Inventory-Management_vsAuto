import React from 'react'
import { Text, View, TextProps, ViewProps, StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native'
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

// Root form provider
export const Form = FormProvider

type FormFieldContextType<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextType | undefined>(undefined)

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

type FormItemContextType = { id: string }
const FormItemContext = React.createContext<FormItemContextType | undefined>(undefined)

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const form = useFormContext()

  if (!fieldContext) throw new Error('useFormField must be used inside a <FormField>')

  const fieldState = form.getFieldState(fieldContext.name, form.formState)
  const id = itemContext?.id ?? `field-${fieldContext.name}`

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error: fieldState.error,
  }
}

export const FormItem = ({
  children,
  style,
  ...props
}: ViewProps & { style?: StyleProp<ViewStyle> }) => {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <View style={[formStyles.item, style]} {...props}>
        {children}
      </View>
    </FormItemContext.Provider>
  )
}

export const FormLabel = ({
  children,
  style,
  ...props
}: TextProps & { style?: StyleProp<TextStyle> }) => {
  const { error, formItemId } = useFormField()
  return (
    <Text
      nativeID={formItemId}
      style={[
        formStyles.label,
        error && formStyles.labelError,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
}

export const FormControl = ({
  children,
  style,
  ...props
}: ViewProps & { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const { error, formItemId, formDescriptionId } = useFormField()
  return (
    <View style={style}>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement, {
            accessibilityLabelledBy: formDescriptionId,
            accessibilityHint: error ? `Error: ${error.message}` : 'Input field',
            accessibilityState: { invalid: !!error },
            nativeID: formItemId,
            ...props,
          })
        : children}
    </View>
  )
}

export const FormDescription = ({
  children,
  style,
  ...props
}: TextProps & { style?: StyleProp<TextStyle> }) => {
  const { formDescriptionId } = useFormField()
  return (
    <Text
      nativeID={formDescriptionId}
      style={[formStyles.description, style]}
      {...props}
    >
      {children}
    </Text>
  )
}

export const FormMessage = ({
  children,
  style,
  ...props
}: TextProps & { style?: StyleProp<TextStyle> }) => {
  const { error, formMessageId } = useFormField()
  const msg = error?.message ? String(error?.message) : children

  if (!msg) return null
  return (
    <Text
      nativeID={formMessageId}
      style={[formStyles.message, style]}
      {...props}
    >
      {msg}
    </Text>
  )
}

const formStyles = StyleSheet.create({
  item: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 2,
  },
  labelError: {
    color: '#ef4444', // destructive
  },
  description: {
    fontSize: 13,
    color: '#64748b', // muted-foreground
    marginTop: 1,
  },
  message: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
    marginTop: 4,
  },
});
