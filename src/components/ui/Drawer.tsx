import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export const Drawer = ({ open, onOpenChange, children }: DrawerProps) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '80%'], []);

  React.useEffect(() => {
    if (open) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [open]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={() => onOpenChange(false)}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView style={styles.bsView}>{children}</BottomSheetView>
    </BottomSheet>
  );
};

export function DrawerContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <View style={[styles.content, style]}>
      <View style={styles.handle} />
      {children}
    </View>
  );
}

export function DrawerHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function DrawerFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

export function DrawerTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function DrawerDescription({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  bsView: {
    backgroundColor: '#fff', // 'bg-background'
    paddingHorizontal: 16,
    paddingTop: 14,
    minHeight: 100,
  },
  content: {
    marginTop: 8,
  },
  handle: {
    alignSelf: 'center',
    marginBottom: 18,
    height: 8,
    width: 100,
    borderRadius: 8,
    backgroundColor: '#f1f5f9', // muted
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'column',
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
