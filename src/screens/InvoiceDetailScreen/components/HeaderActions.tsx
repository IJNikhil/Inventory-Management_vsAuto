import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { useColors } from '../../../context/ThemeContext';
import styles from '../styles';

interface HeaderActionsProps {
  onShare: () => Promise<void>;
  isGenerating: boolean;
}

export default function HeaderActions({ onShare, isGenerating }: HeaderActionsProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onShare}
      style={[
        styles.shareBtn,
        {
          backgroundColor: colors.primary,
          flexDirection: 'row', // icon + text in a row
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isGenerating ? 0.7 : 1,
        },
      ]}
      activeOpacity={0.8}
      disabled={isGenerating}
      accessibilityRole="button"
      accessibilityLabel={isGenerating ? 'Generating PDF' : 'Share Invoice'}
    >
      {isGenerating ? (
        <ActivityIndicator size="small" color={colors.primaryForeground} style={{ marginRight: 8 }} />
      ) : (
        <Share2 size={16} color={colors.primaryForeground} style={{ marginRight: 8 }} />
      )}
      <Text
        style={[
          styles.shareBtnText,
          {
            color: colors.primaryForeground,
            fontWeight: '700',
          },
        ]}
      >
        {isGenerating ? 'Generating...' : 'Share'}
      </Text>
    </TouchableOpacity>
  );
}
