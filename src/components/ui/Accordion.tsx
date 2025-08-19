import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ChevronDown } from 'lucide-react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
  style?: any;
  containerStyle?: any;
}

export const AccordionItem = ({
  title,
  children,
  initiallyOpen = false,
  style,
  containerStyle,
}: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((open) => !open);
  };

  return (
    <View style={[styles.itemContainer, containerStyle]}>
      <TouchableOpacity
        onPress={toggleAccordion}
        style={styles.headerRow}
        activeOpacity={0.8}
      >
        <Text style={styles.title}>{title}</Text>
        <ChevronDown
          size={20}
          color="#64748b"
          style={[
            styles.chevron,
            isOpen ? { transform: [{ rotate: '180deg' }] } : undefined,
          ]}
        />
      </TouchableOpacity>
      <Collapsible collapsed={!isOpen}>
        <View style={styles.content}>{children}</View>
      </Collapsible>
    </View>
  );
};

export const Accordion = ({
  children,
  style,
}: { children: React.ReactNode; style?: any }) => (
  <View style={style}>{children}</View>
);

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#18181b',
  },
  chevron: {
    // Add margin, spacing etc. here if needed, but NOT color!
  },
  content: {
    paddingTop: 0,
    paddingBottom: 16,
  },
});
