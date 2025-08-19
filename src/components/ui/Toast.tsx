import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Toast, {
  ToastConfig,
  BaseToastProps,
  ToastShowParams,
} from 'react-native-toast-message';
import { X } from 'lucide-react-native';

export type ToastVariant = 'default' | 'destructive';

/**
 * ToastProvider: Renders the toast UI layer. Place it in your app root.
 */
export const ToastProvider = () => {
  return <Toast config={toastConfig} />;
};

// Base styles for toast container by variant
const toastContainerStyles = StyleSheet.create({
  base: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e3e7', // border-muted approximated
    backgroundColor: '#fff', // background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    padding: 16,
    marginVertical: 8,
    width: '90%',
    alignSelf: 'center',
  },
  destructive: {
    backgroundColor: '#dc2626', // red-600
    borderColor: '#b91c1c', // red-700
  },
});

// Styles for toast text
const toastTextStyles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b', // foreground
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#64748b', // muted-foreground
  },
  destructiveText: {
    color: '#fff',
  },
});

/**
 * ToastContainer UI — shared between variants.
 */
const ToastContainer = ({
  text1,
  text2,
  onPress,
  variant = 'default',
}: BaseToastProps & { variant?: ToastVariant }) => {
  const isDestructive = variant === 'destructive';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      style={[
        toastContainerStyles.base,
        isDestructive && toastContainerStyles.destructive,
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          {text1 && (
            <Text
              style={[
                toastTextStyles.title,
                isDestructive && toastTextStyles.destructiveText,
              ]}
            >
              {text1}
            </Text>
          )}
          {text2 && (
            <Text
              style={[
                toastTextStyles.description,
                isDestructive && toastTextStyles.destructiveText,
              ]}
            >
              {text2}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
          <X size={20} color={isDestructive ? '#fff' : 'grey'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const toastConfig: ToastConfig = {
  default: (props) => <ToastContainer {...props} variant="default" />,
  destructive: (props) => <ToastContainer {...props} variant="destructive" />,
};

/**
 * Hook to trigger toasts
 */
export const useToast = () => {
  const show = ({
    title,
    description,
    type = 'default',
    ...rest
  }: {
    title: string;
    description?: string;
    type?: ToastVariant;
  } & Omit<ToastShowParams, 'text1' | 'text2'>) => {
    Toast.show({
      type,
      text1: title,
      text2: description,
      ...rest,
    });
  };

  const hide = () => {
    Toast.hide();
  };

  return { show, hide };
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
