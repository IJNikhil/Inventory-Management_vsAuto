import React, {
  useState,
  useContext,
  createContext,
  ReactNode,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  ViewStyle,
} from 'react-native';

// Enable layout animation on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const collapsibleStyles = StyleSheet.create({
  collapsible: {
    overflow: 'hidden',
  },
});

// -------- Context --------
type CollapsibleContextType = {
  open: boolean;
  setOpen: (value: boolean) => void;
};
const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined);
function useCollapsible() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible must be used within a <Collapsible />');
  }
  return context;
}

// -------- Collapsible Provider --------
type CollapsibleProps = {
  defaultOpen?: boolean;
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
};
export function Collapsible({ defaultOpen = false, children, style }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <View style={style}>{children}</View>
    </CollapsibleContext.Provider>
  );
}

// -------- Trigger --------
type TriggerProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
};
export function CollapsibleTrigger({ children, style }: TriggerProps) {
  const { open, setOpen } = useCollapsible();

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style} activeOpacity={0.8}>
      {children}
    </TouchableOpacity>
  );
}

// -------- Animated Content --------
type ContentProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export function CollapsibleContent({ children, style }: ContentProps) {
  const { open } = useCollapsible();
  const contentHeight = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(contentHeight, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [open, contentHeight]);

  const heightInterpolate = contentHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 9999], // Adjust max height if necessary
  });

  return (
    <Animated.View
      style={[
        { height: heightInterpolate },
        collapsibleStyles.collapsible,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
