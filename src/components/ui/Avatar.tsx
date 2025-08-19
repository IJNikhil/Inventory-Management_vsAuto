import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

export type AvatarProps = {
  uri?: string;
  fallback?: string;
  size?: number;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  imageStyle?: ImageStyle | ImageStyle[];
};

export const Avatar = ({
  uri,
  fallback,
  size = 40,
  style,
  textStyle,
  imageStyle,
}: AvatarProps) => {
  const [error, setError] = React.useState(false);
  const showFallback = !uri || error;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {showFallback ? (
        <Text
          style={[
            styles.fallback,
            { fontSize: size * 0.475 },
            textStyle,
          ]}
        >
          {fallback ?? '👤'}
        </Text>
      ) : (
        <Image
          source={{ uri }}
          onError={() => setError(true)}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
            imageStyle,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6', // muted
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    color: '#18181b',      // foreground
    fontWeight: '600',
    textAlign: 'center',
  },
});
