import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { X } from 'lucide-react-native';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={open}
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable
        onPress={() => onOpenChange(false)}
        style={styles.overlay}
      />
      <View style={styles.centered}>
        <View style={styles.contentCard}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function DialogClose({
  onPress,
  style,
  iconStyle,
}: {
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  iconStyle?: TextStyle | TextStyle[];
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.closeBtn, style]}
      activeOpacity={0.82}
    >
      <X size={18} color="#64748b" style={iconStyle} />
    </TouchableOpacity>
  );
}

export function DialogHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
}

export function DialogFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
}

export function DialogTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}) {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
}

export function DialogDescription({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}) {
  return (
    <Text style={[styles.description, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.80)',
    zIndex: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    paddingHorizontal: 16,
  },
  contentCard: {
    backgroundColor: '#fff', // Use your theme, e.g. theme.colors.background
    width: '100%',
    maxWidth: 520,
    borderRadius: 16,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
    padding: 24,
    zIndex: 50,
  },
  scroll: {
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.7,
    borderRadius: 30,
    padding: 9,
    backgroundColor: '#facc15', // accent
    zIndex: 99,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  footer: {
    flexDirection: 'column-reverse',
    marginTop: 24,
    gap: 8,
    // For "sm:flex-row sm:justify-end", you can override with prop styles if needed
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 20,
  },
});
