import React from 'react'
import {
  Modal,
  View,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native'

export const Popover = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return <>{children}</>
}

export const PopoverTrigger = ({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode
  onPress: (event: GestureResponderEvent) => void
  style?: ViewStyle | ViewStyle[]
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.83}>
      {children}
    </TouchableOpacity>
  )
}

export const PopoverContent = ({
  open,
  onClose,
  children,
  style,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}) => {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={styles.overlay} />
      <View style={styles.centered}>
        <View style={[styles.content, style]}>
          {children}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 288, // w-72
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc', // bg-popover
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
})
