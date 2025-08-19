import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useColors } from '../../../context/ThemeContext';
import styles from '../styles';

interface BackButtonProps {
  onPress: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.backBtn, {
        backgroundColor: colors.background,
        borderColor: colors.border,
      }]}
      activeOpacity={0.7}
    >
      <ArrowLeft size={20} color={colors.primary} />
    </TouchableOpacity>
  );
}
