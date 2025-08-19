import React from 'react'
import {
  Modal,
  View,
  Pressable,
  TouchableOpacity,
  GestureResponderEvent,
  StyleSheet,
  ViewStyle,
} from 'react-native'

/**
 * Popover container
 */
export const Popover = ({
  children,
}: {
  children: React.ReactNode
}) => <>{children}</>

/**
 * Trigger Button (wrap any content)
 */
export const PopoverTrigger = ({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode
  onPress: (event: GestureResponderEvent) => void
  style?: ViewStyle | ViewStyle[]
}) => (
  <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
    {children}
  </TouchableOpacity>
)

/**
 * Popover content modal
 */
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
}) => (
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: 288, // w-72
    backgroundColor: '#f8fafc', // bg-popover
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
})
