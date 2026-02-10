/**
 * ImagePickerModal
 *
 * A modal that lets users choose between camera and photo gallery
 * for selecting an image. Clean, accessible UI with themed styling.
 */

import { useTheme } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface ImagePickerModalProps {
  visible: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onCancel: () => void;
}

function ImagePickerModal({ visible, onCamera, onGallery, onCancel }: ImagePickerModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
      accessibilityViewIsModal
      accessibilityLabel="Image picker options"
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Close image picker"
        accessibilityHint="Tap to dismiss the picker"
      >
        <Pressable
          className="rounded-t-3xl pb-8 pt-4 px-6"
          style={{ backgroundColor: colors.surface }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View
            className="self-center w-10 h-1 rounded-full mb-5"
            style={{ backgroundColor: colors.border }}
          />

          <Text
            className="text-lg font-bold text-center mb-1"
            style={{ color: colors.text }}
          >
            Select Photo
          </Text>
          <Text
            className="text-sm text-center mb-6"
            style={{ color: colors.textSecondary }}
          >
            Choose where to pick your profile picture from
          </Text>

          <View className="gap-3">
            {/* Camera Option */}
            <Pressable
              onPress={onCamera}
              className="flex-row items-center p-4 rounded-2xl"
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              accessibilityRole="button"
              accessibilityLabel="Take a photo with camera"
              accessibilityHint="Opens the camera to take a new photo"
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary + '15' }}
              >
                <Ionicons name="camera" size={24} color={colors.primary} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Camera
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                  Take a new photo
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </Pressable>

            {/* Gallery Option */}
            <Pressable
              onPress={onGallery}
              className="flex-row items-center p-4 rounded-2xl"
              style={{
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              accessibilityRole="button"
              accessibilityHint="Opens your photo library to select an existing photo"
              accessibilityLabel="Choose from photo gallery"
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.accent + '15' }}
              >
                <Ionicons name="images" size={24} color={colors.accent} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  Gallery
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                  Choose from your photos
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </Pressable>
          </View>

          {/* Cancel button */}
          <Pressable
            onPress={onCancel}
            className="mt-4 py-3.5 rounded-2xl items-center"
            style={{ backgroundColor: colors.surfaceSecondary }}
            accessibilityRole="button"
            accessibilityHint="Dismisses the image picker without selecting a photo"
            accessibilityLabel="Cancel"
          >
            <Text className="text-base font-semibold" style={{ color: colors.textSecondary }}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default React.memo(ImagePickerModal);
