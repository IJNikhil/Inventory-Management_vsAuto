import React from 'react'
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ViewProps,
} from 'react-native'
import { Check, Circle } from 'lucide-react-native'

export const Menubar = ({
  children,
  style,
  ...props
}: ViewProps & { children?: React.ReactNode }) => (
  <View style={[styles.root, style]} {...props}>
    {children}
  </View>
)

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
    activeOpacity={0.82}
  >
    <Text style={[styles.triggerText, textStyle]}>{label}</Text>
  </TouchableOpacity>
)

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
    <Pressable style={styles.backdrop} onPress={onClose} />
    <View style={[styles.menuContent, style]}>{children}</View>
  </Modal>
)

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
      inset && styles.insetItem,
      disabled && styles.itemDisabled,
      style,
    ]}
  >
    {children}
  </Pressable>
)

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
    <View style={styles.checkWrap}>
      {checked && <Check size={16} color="#0d9488" />}
    </View>
    <Text style={[styles.menuItemText, { paddingLeft: 18 }, textStyle]}>{label}</Text>
  </MenubarItem>
)

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
    <View style={styles.checkWrap}>
      {selected && <Circle size={8} color="#0d9488" fill="#0d9488" />}
    </View>
    <Text style={[styles.menuItemText, { paddingLeft: 18 }, textStyle]}>{label}</Text>
  </MenubarItem>
)

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
  <Text style={[
    styles.menuLabel,
    inset && styles.insetItem,
    textStyle,
    style,
  ]}>
    {children}
  </Text>
)

export const MenubarSeparator = ({ style }: { style?: ViewStyle | ViewStyle[] }) => (
  <View style={[styles.separator, style]} />
)

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
  root: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 4,
    gap: 6,
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181b',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContent: {
    position: 'absolute',
    top: '25%',
    left: 24,
    right: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
    zIndex: 99,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 7,
    marginVertical: 2,
  },
  insetItem: {
    paddingLeft: 28,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  checkWrap: {
    position: 'absolute',
    left: 8,
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: '#18181b',
    marginLeft: 10,
  },
  menuLabel: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  separator: {
    marginVertical: 7,
    height: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 1,
  },
  shortcut: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 2,
    opacity: 0.6,
    textAlign: 'right',
  },
})
