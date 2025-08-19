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

export const Menubar = ({ children, style, ...props }: ViewProps & { style?: ViewStyle | ViewStyle[] }) => (
  <View style={[styles.menubar, style]} {...props}>
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
    activeOpacity={0.83}
  >
    <Text style={[styles.triggerLabel, textStyle]}>{label}</Text>
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
    <Pressable onPress={onClose} style={styles.overlay} />
    <View style={[styles.menuContent, style]}>
      {children}
    </View>
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
      inset && styles.itemInset,
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
    <View style={styles.iconLeft}>
      {checked && <Check size={16} color="#0d9488" />}
    </View>
    <Text style={[styles.menuItemText, styles.checkboxText, textStyle]}>{label}</Text>
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
    <View style={styles.iconLeft}>
      {selected && <Circle size={10} color="#0d9488" fill="#0d9488" />}
    </View>
    <Text style={[styles.menuItemText, styles.checkboxText, textStyle]}>{label}</Text>
  </MenubarItem>
)

export const MenubarLabel = ({
  children,
  style,
  inset,
  textStyle,
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
  <Text style={[styles.shortcut, textStyle, style]}>
    {children}
  </Text>
)

const styles = StyleSheet.create({
  menubar: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderRadius: 10,
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
  },
  triggerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#18181b',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
    zIndex: 40,
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
    paddingLeft: 0,
  },
  checkboxText: {
    paddingLeft: 18,
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
