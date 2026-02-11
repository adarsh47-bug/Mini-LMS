/**
 * ConfirmModal
 *
 * A minimalist custom modal for confirmations (e.g., sign out).
 * NativeWind for layout, theme-context for colors.
 */

import { useTheme } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import ThemedButton from './ThemedButton';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon = 'alert-circle-outline',
  variant = 'warning',
  loading = false,
}: ConfirmModalProps) {
  const { colors } = useTheme();

  const iconColor = variant === 'danger' ? colors.error : variant === 'warning' ? '#F59E0B' : colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
      accessibilityViewIsModal
      accessibilityLabel={title}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        accessibilityHint="Tap to dismiss the confirmation dialog"
      >
        {/* Modal Content */}
        <Pressable
          className="w-full max-w-sm rounded-3xl p-6"
          style={{ backgroundColor: colors.surface }}
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="alert"
          accessibilityLabel={`${title}. ${message}`}
        >
          {/* Icon */}
          <View
            className="w-16 h-16 rounded-full items-center justify-center self-center mb-4"
            style={{ backgroundColor: iconColor + '20' }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Ionicons name={icon} size={32} color={iconColor} />
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-center mb-2" style={{ color: colors.text }}>
            {title}
          </Text>

          {/* Message */}
          <Text className="text-base text-center leading-6 mb-6" style={{ color: colors.textSecondary }}>
            {message}
          </Text>

          {/* Actions */}
          <View className="gap-3">
            <ThemedButton
              title={confirmText}
              onPress={onConfirm}
              variant="primary"
              loading={loading}
              disabled={loading}
              style={variant === 'danger' ? { backgroundColor: colors.error } : undefined}
              accessibilityLabel={confirmText}
              accessibilityHint={`Confirms the action: ${title}`}
            />
            <ThemedButton
              title={cancelText}
              onPress={onCancel}
              variant="outline"
              disabled={loading}
              accessibilityLabel={cancelText}
              accessibilityHint="Closes the dialog without making changes"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default React.memo(ConfirmModal);
