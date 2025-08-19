import React from 'react'
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ViewProps,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { Check, Circle } from 'lucide-react-native'

// Root Wrapper
export const Menubar = ({ children, style, ...props }: ViewProps) => (
  <View style={[styles.menubar, style]} {...props}>
    {children}
  </View>
)

// Trigger
export const MenubarTrigger = ({
  label,
  onPress,
  style,
  textStyle,
}: {
  label: string
  onPress: () => void
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.trigger, style]}
    activeOpacity={0.83}
  >
    <Text style={[styles.triggerLabel, textStyle]}>{label}</Text>
  </TouchableOpacity>
)

// Modal Content
export const MenubarContent = ({
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
  <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
    <Pressable onPress={onClose} style={styles.overlay} />
    <View style={[styles.menuContent, style]}>
      {children}
    </View>
  </Modal>
)

// Item
export const MenubarItem = ({
  children,
  onPress,
  disabled,
  inset,
  style,
}: {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  inset?: boolean
  style?: ViewStyle | ViewStyle[]
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.item,
      inset && styles.itemInset,
      disabled && styles.itemDisabled,
      style,
    ]}
  >
    {children}
  </Pressable>
)

// Checkbox item
export const MenubarCheckboxItem = ({
  checked,
  onPress,
  label,
  style,
  textStyle,
}: {
  checked: boolean
  onPress: () => void
  label: string
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
}) => (
  <MenubarItem onPress={onPress} style={style}>
    <View style={styles.iconLeft}>
      {checked && <Check size={16} color="#0d9488" />}
    </View>
    <Text style={[styles.menuItemText, styles.checkboxText, textStyle]}>{label}</Text>
  </MenubarItem>
)

// Radio item
export const MenubarRadioItem = ({
  selected,
  onPress,
  label,
  style,
  textStyle,
}: {
  selected: boolean
  onPress: () => void
  label: string
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
}) => (
  <MenubarItem onPress={onPress} style={style}>
    <View style={styles.iconLeft}>
      {selected && <Circle size={10} color="#0d9488" fill="#0d9488" />}
    </View>
    <Text style={[styles.menuItemText, styles.checkboxText, textStyle]}>{label}</Text>
  </MenubarItem>
)

// Section Label
export const MenubarLabel = ({
  children,
  style,
  textStyle,
  inset,
}: {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
  inset?: boolean
}) => (
  <Text
    style={[
      styles.label,
      inset && styles.itemInset,
      textStyle,
      style,
    ]}
  >
    {children}
  </Text>
)

// Separator
export const MenubarSeparator = ({ style }: { style?: ViewStyle | ViewStyle[] }) => (
  <View style={[styles.separator, style]} />
)

// Shortcut (right-aligned text)
export const MenubarShortcut = ({
  children,
  style,
  textStyle,
}: {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle | TextStyle[]
}) => (
  <Text style={[styles.shortcut, textStyle, style]}>{children}</Text>
)

const styles = StyleSheet.create({
  menubar: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 4,
    gap: 4,
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 5,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  triggerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#18181b',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  menuContent: {
    position: 'absolute',
    top: '25%',
    left: 24,
    right: 24,
    zIndex: 50,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 15,
    elevation: 7,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 5,
    marginVertical: 2,
    position: 'relative', // for absolute icon
  },
  itemInset: {
    paddingLeft: 32,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  iconLeft: {
    position: 'absolute',
    left: 8,
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: '#18181b',
    fontWeight: '400',
    marginLeft: 18,
  },
  checkboxText: {
    paddingLeft: 0,
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  separator: {
    marginVertical: 6,
    height: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 1,
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#64748b',
    opacity: 0.7,
    letterSpacing: 2,
    textAlign: 'right',
  },
});
