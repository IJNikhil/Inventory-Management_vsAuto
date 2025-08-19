import React, { useState } from 'react';
import { View, FlatList, Image } from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { SCREEN_WIDTH, styles } from './part-detail-styles';

interface ImageSwiperProps {
  images: string[];
  partName: string;
}

export function ImageSwiper({ images, partName }: ImageSwiperProps) {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  return (
    <View style={styles.swiperContainer}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index: imgIdx }) => (
          <Image
            source={{ uri: item }}
            resizeMode="cover"
            style={styles.partImage}
            accessibilityLabel={`${partName} image ${imgIdx + 1}`}
          />
        )}
        onMomentumScrollEnd={ev => {
          const newIdx = Math.round(ev.nativeEvent.contentOffset.x / (SCREEN_WIDTH * 0.8));
          setCurrentIndex(newIdx);
        }}
      />
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: currentIndex === i ? colors.primary : colors.border
                }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}
