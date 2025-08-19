import React, { useState, createContext, useContext } from 'react'
import { View, Text, Pressable, ViewProps, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native'

// ----- CONTEXT -----
type TabsContextType = {
  value: string
  setValue: (val: string) => void
}
const TabsContext = createContext<TabsContextType | null>(null)

// ----- ROOT -----
export const Tabs = ({
  defaultValue,
  children,
}: {
  defaultValue: string
  children: React.ReactNode
}) => {
  const [value, setValue] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  )
}

// ----- LIST -----
export const TabsList = ({
  style,
  children,
  ...props
}: ViewProps & { style?: StyleProp<ViewStyle> }) => (
  <View
    style={[styles.list, style]}
    {...props}
  >
    {children}
  </View>
)

// ----- TRIGGER -----
export const TabsTrigger = ({
  value,
  children,
  style,
  textStyle,
  disabled,
}: {
  value: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  disabled?: boolean
}) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within <Tabs>')
  const isActive = context.value === value

  return (
    <Pressable
      onPress={() => !disabled && context.setValue(value)}
      disabled={disabled}
      style={[
        styles.trigger,
        isActive ? styles.triggerActive : styles.triggerInactive,
        disabled && styles.triggerDisabled,
        style,
      ]}
    >
      <Text style={[styles.triggerText, textStyle]}>
        {children}
      </Text>
    </Pressable>
  )
}

// ----- CONTENT -----
export const TabsContent = ({
  value,
  children,
  style,
  ...props
}: {
  value: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within <Tabs>')
  if (context.value !== value) return null
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  )
}

// ----- STYLES -----
const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    backgroundColor: '#f3f4f6', // muted
    padding: 4,
    marginBottom: 4,
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7,
    marginHorizontal: 2,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  triggerActive: {
    backgroundColor: '#fff', // bg-background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  triggerInactive: {
    backgroundColor: 'transparent',
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b', // muted-foreground
  },
  content: {
    marginTop: 8,
  },
})

