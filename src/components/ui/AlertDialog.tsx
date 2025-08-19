import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';

type AlertDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  style?: ViewStyle | ViewStyle[];
};

type ButtonProps = {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

export function AlertDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  style,
}: AlertDialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.card, style]}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description ? (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel label={cancelLabel} onPress={onCancel} />
            <AlertDialogAction label={confirmLabel} onPress={onConfirm} />
          </AlertDialogFooter>
        </View>
      </View>
    </Modal>
  );
}

export const AlertDialogHeader = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const AlertDialogTitle = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

export const AlertDialogDescription = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

export const AlertDialogFooter = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) => (
  <View style={[styles.footer, style]}>{children}</View>
);

export const AlertDialogAction = ({
  label,
  onPress,
  style,
  textStyle,
}: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.actionButton, style]}
    activeOpacity={0.85}
  >
    <Text style={[styles.actionText, textStyle]}>{label}</Text>
  </TouchableOpacity>
);

export const AlertDialogCancel = ({
  label,
  onPress,
  style,
  textStyle,
}: ButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.cancelButton, style]}
    activeOpacity={0.8}
  >
    <Text style={[styles.cancelText, textStyle]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 15,
  },
  header: {
    marginBottom: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
    textAlign: 'center',
    marginBottom: 3,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 23,
  },
  actionButton: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 7,
    marginLeft: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 7,
    marginRight: 4,
  },
  cancelText: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '600',
  },
});

