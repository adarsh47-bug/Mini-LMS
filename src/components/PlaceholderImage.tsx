/**
 * PlaceholderImage
 *
 * Displays an image with a themed fallback placeholder when the image
 * fails to load or no URI is provided. Uses expo-image for optimized
 * loading with disk+memory caching.
 */

import { useTheme } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageContentFit, type ImageStyle } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

interface PlaceholderImageProps {
  /** Image URI — if falsy, placeholder is shown immediately */
  uri: string | undefined | null;
  /** Width of the image container */
  width: DimensionValue;
  /** Height of the image container */
  height: number;
  /** Border radius (default: 0) */
  borderRadius?: number;
  /** Content fit mode (default: 'cover') */
  contentFit?: ImageContentFit;
  /** Ionicons icon name for placeholder (default: 'image-outline') */
  placeholderIcon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Icon size for placeholder (default: height * 0.35, capped at 48) */
  iconSize?: number;
  /** Container style override */
  style?: StyleProp<ViewStyle>;
}

function PlaceholderImage({
  uri,
  width,
  height,
  borderRadius = 0,
  contentFit = 'cover',
  placeholderIcon = 'image-outline',
  iconSize,
  style,
}: PlaceholderImageProps) {
  const { colors } = useTheme();
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => setHasError(true), []);

  const showPlaceholder = !uri || hasError;
  const resolvedIconSize = iconSize ?? Math.min(height * 0.35, 48);

  if (showPlaceholder) {
    return (
      <View
        style={[
          {
            width,
            height,
            borderRadius,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Ionicons name={placeholderIcon} size={resolvedIconSize} color={colors.textTertiary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width, height, borderRadius } as ImageStyle, style as ImageStyle]}
      contentFit={contentFit}
      transition={200}
      cachePolicy="memory-disk"
      onError={handleError}
    />
  );
}

export default React.memo(PlaceholderImage);
