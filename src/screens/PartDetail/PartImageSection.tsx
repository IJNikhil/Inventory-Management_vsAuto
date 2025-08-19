import React from 'react';
import { View, Text } from 'react-native';
import { Package } from 'lucide-react-native';
import { useColors } from '../../context/ThemeContext';
import { styles } from './part-detail-styles';
import { ImageSwiper } from './ImageSwiper';


interface PartImageSectionProps {
  images: string[];
  partName: string;
}

export function PartImageSection({ images, partName }: PartImageSectionProps) {
  const colors = useColors();

  return (
    <View style={[styles.imageSection, { backgroundColor: colors.muted }]}>
      {images.length > 0 ? (
        <ImageSwiper images={images} partName={partName} />
      ) : (
        <View style={[styles.noImageContainer, { backgroundColor: colors.muted }]}>
          <Package size={60} color={colors.mutedForeground} />
          <Text style={[styles.noImageText, { color: colors.mutedForeground }]}>
            No Image Available
          </Text>
        </View>
      )}
    </View>
  );
}
