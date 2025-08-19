import React from 'react'
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  Pressable,
  GestureResponderEvent,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { X } from 'lucide-react-native'

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={open}
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable onPress={() => onOpenChange(false)} style={styles.overlay} />
      {children}
    </Modal>
  )
}

export const SheetTrigger = ({
  onPress,
  children,
  style,
}: {
  onPress: (event: GestureResponderEvent) => void
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      {children}
    </TouchableOpacity>
  )
}

type SheetContentProps = {
  side?: 'top' | 'bottom' | 'left' | 'right'
  onClose?: () => void
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}

export const SheetContent = ({
  side = 'bottom',
  onClose,
  children,
  style,
}: SheetContentProps) => {
  let positionStyles: ViewStyle = styles.sheetBottom
  if (side === 'top') positionStyles = styles.sheetTop
  if (side === 'left') positionStyles = styles.sheetLeft
  if (side === 'right') positionStyles = styles.sheetRight

  return (
    <View style={[styles.sheetBase, positionStyles, style]}>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.68}>
          <X size={20} color="#64748b" />
        </TouchableOpacity>
      )}
      {children}
    </View>
  )
}

export const SheetHeader = ({
  children,
  style,
}: {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}) => {
  return <View style={[styles.header, style]}>{children}</View>
}

export const SheetFooter = ({
  children,
  style,
}: {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
}) => {
  return <View style={[styles.footer, style]}>{children}</View>
}

export const SheetTitle = ({
  children,
  style,
}: {
  children: React.ReactNode
  style?: TextStyle | TextStyle[]
}) => {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  )
}

export const SheetDescription = ({
  children,
  style,
}: {
  children: React.ReactNode
  style?: TextStyle | TextStyle[]
}) => {
  return (
    <Text style={[styles.description, style]}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetBase: {
    position: 'absolute',
    zIndex: 50,
    backgroundColor: '#f1f5f9', // card bg
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
  },
  sheetBottom: {
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  sheetTop: {
    left: 0,
    right: 0,
    top: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    maxHeight: '80%',
  },
  sheetLeft: {
    left: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  sheetRight: {
    right: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 5,
    opacity: 0.72,
    borderRadius: 99,
    backgroundColor: '#f3f4f6',
    zIndex: 100,
  },
  header: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
  },
})

