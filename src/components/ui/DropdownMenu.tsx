import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Check, Circle, ChevronRight } from 'lucide-react-native';

// Modal dropdown root
export const DropdownMenu = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => (
  <Modal
    transparent
    visible={open}
    animationType="fade"
    onRequestClose={() => onOpenChange(false)}
  >
    <Pressable style={styles.backdrop} onPress={() => onOpenChange(false)} />
    <View style={styles.menuContainer}>{children}</View>
  </Modal>
);

// Trigger
export const DropdownMenuTrigger = ({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.84}>
    {children}
  </TouchableOpacity>
);

// Group wrapper
export const DropdownMenuGroup = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => <View style={style}>{children}</View>;

// Standard menu item
export const DropdownMenuItem = ({
  children,
  onPress,
  disabled,
  inset,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
}) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={[
      styles.menuItem,
      inset && styles.insetItem,
      disabled && styles.disabled,
      style,
    ]}
  >
    {children}
  </Pressable>
);

// Checkbox item
export const DropdownMenuCheckboxItem = ({
  children,
  checked = false,
  onPress,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  checked: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) => (
  <DropdownMenuItem onPress={onPress} style={[styles.checkboxItem, style]}>
    <View style={styles.iconWrapper}>
      {checked && <Check size={16} color="#0d9488" />}
    </View>
    <Text style={[styles.menuItemText, textStyle]}>{children}</Text>
  </DropdownMenuItem>
);

// Radio item
export const DropdownMenuRadioItem = ({
  children,
  selected = false,
  onPress,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) => (
  <DropdownMenuItem onPress={onPress} style={[styles.checkboxItem, style]}>
    <View style={styles.iconWrapper}>
      {selected && <Circle size={10} color="#0d9488" fill="#0d9488" />}
    </View>
    <Text style={[styles.menuItemText, textStyle]}>{children}</Text>
  </DropdownMenuItem>
);

// RadioGroup wrapper
export const DropdownMenuRadioGroup = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => <View style={[styles.radioGroup, style]}>{children}</View>;

// Submenu trigger
export const DropdownMenuSubTrigger = ({
  children,
  inset,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) => (
  <View style={[styles.menuItem, inset && styles.insetItem, style]}>
    <Text style={[styles.menuItemText, textStyle]}>{children}</Text>
    <ChevronRight size={14} color="#64748b" style={{ marginLeft: 'auto' }} />
  </View>
);

// Sub content
export const DropdownMenuSubContent = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => <View style={[styles.subContent, style]}>{children}</View>;

// Label -- FIX: wrap text with View, separate style/textStyle
export const DropdownMenuLabel = ({
  children,
  inset,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) => (
  <View style={style}>
    <Text
      style={[
        styles.label,
        inset && styles.insetItemLabel, // handle label inset as text style
        textStyle,
      ]}
    >
      {children}
    </Text>
  </View>
);

// Separator
export const DropdownMenuSeparator = ({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) => <View style={[styles.separator, style]} />;

// Shortcut helper (usually right aligned) -- FIX: wrap with View for outer style, only textStyle to Text
export const DropdownMenuShortcut = ({
  children,
  style,
  textStyle,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) => (
  <View style={style}>
    <Text style={[styles.shortcut, textStyle]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
    zIndex: 99,
  },
  menuContainer: {
    position: 'absolute',
    top: '30%',
    left: 16,
    right: 16,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc', // popover
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
    zIndex: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: 'transparent',
    marginVertical: 1,
  },
  menuItemText: {
    fontSize: 15,
    color: '#18181b',
  },
  checkboxItem: {
    paddingLeft: 32, // pl-8
    paddingRight: 8,
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    left: 10,
    height: 22,
    width: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  insetItem: {
    paddingLeft: 32, // pl-8
  },
  insetItemLabel: {
    paddingLeft: 32, // Fix for label text inset
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
    opacity: 0.6,
    textAlign: 'right',
    letterSpacing: 2,
  },
  radioGroup: {
    marginVertical: 4,
    gap: 6,
  },
  subContent: {
    marginTop: 8,
    paddingLeft: 20,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default DropdownMenu;
