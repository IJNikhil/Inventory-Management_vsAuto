import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

type CarouselProps = {
  children: React.ReactNode[];
  style?: ViewStyle | ViewStyle[];
  itemStyle?: ViewStyle | ViewStyle[];
  height?: number;
};

export function Carousel({
  children,
  style,
  itemStyle,
  height = 200,
}: CarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const total = children.length;
  const { width } = Dimensions.get('window');

  const scrollToIndex = (i: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: i * width, animated: true });
      setIndex(i);
    }
  };

  const handleNext = () => {
    if (index < total - 1) scrollToIndex(index + 1);
  };

  const handlePrev = () => {
    if (index > 0) scrollToIndex(index - 1);
  };

  return (
    <View style={[styles.root, { height }, style]}>
      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        scrollEventThrottle={16}
      >
        {children.map((child, i) => (
          <View
            key={i}
            style={[styles.item, { width }, itemStyle]}
          >
            {child}
          </View>
        ))}
      </ScrollView>

      {/* Left Button */}
      {index > 0 && (
        <TouchableOpacity
          onPress={handlePrev}
          style={[styles.arrowBtn, styles.arrowLeft]}
          activeOpacity={0.82}
        >
          <ChevronLeft size={20} color="#18181b" />
        </TouchableOpacity>
      )}
      {/* Right Button */}
      {index < total - 1 && (
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.arrowBtn, styles.arrowRight]}
          activeOpacity={0.82}
        >
          <ChevronRight size={20} color="#18181b" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  item: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -23, // half of button height for centering
    backgroundColor: 'rgba(255,255,255,0.81)',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 50,
    padding: 10,
    zIndex: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  arrowLeft: {
    left: 10,
  },
  arrowRight: {
    right: 10,
  },
});
