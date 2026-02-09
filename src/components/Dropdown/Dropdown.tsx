import { useTheme } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import { useDropdownAnimations } from './dropdown.animations';
import { useDropdownGesture } from './dropdown.gestures';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export interface DropdownOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
}

export interface DropdownProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: DropdownOption[];
  position?: 'bottom' | 'center';
}

export function Dropdown({
  visible,
  onClose,
  title,
  options,
  position = 'bottom',
}: DropdownProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) setModalVisible(true);
  }, [visible]);

  const {
    backdropOpacity,
    dragY,
    menuTranslateY,
    backdropStyle,
    menuStyle,
  } = useDropdownAnimations(visible, () => setModalVisible(false));

  const panGesture = useDropdownGesture({
    dragY,
    backdropOpacity,
    menuTranslateY,
    onClose,
  });

  useEffect(() => {
    if (!visible) return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => sub.remove();
  }, [visible, onClose]);

  const handleOptionPress = useCallback(
    (option: DropdownOption) => {
      if (option.disabled || option.loading) return;
      onClose();
      setTimeout(option.onPress, 120);
    },
    [onClose]
  );

  const memoOptions = useMemo(() => options, [options]);

  if (!modalVisible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <View
          style={[
            styles.menuWrapper,
            position === 'center' ? styles.center : styles.bottom,
          ]}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.menu,
                { backgroundColor: colors.surface },
                menuStyle,
              ]}
            >
              <View style={styles.handleContainer}>
                <View
                  style={[styles.handle, { backgroundColor: colors.textSecondary }]}
                />
              </View>

              {title && (
                <View style={styles.header}>
                  <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                    {title}
                  </Text>
                </View>
              )}

              {memoOptions.map((option) => {
                const color =
                  option.color ||
                  (option.destructive ? colors.error : colors.text);

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.option,
                      option.disabled && { opacity: 0.5 },
                    ]}
                    disabled={option.disabled}
                    onPress={() => handleOptionPress(option)}
                  >
                    {option.icon && (
                      <View style={styles.icon}>
                        {option.loading ? (
                          <ActivityIndicator size="small" color={color} />
                        ) : (
                          <Ionicons name={option.icon} size={22} color={color} />
                        )}
                      </View>
                    )}

                    <Text style={[styles.label, { color }]}>{option.label}</Text>
                    {/* 
                    {option.icon && (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textSecondary}
                      />
                    )} */}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuWrapper: { flex: 1 },
  bottom: { justifyContent: 'flex-end' },
  center: { justifyContent: 'center', paddingHorizontal: 16 },
  menu: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    paddingBottom: 20,
  },
  handleContainer: { paddingVertical: 10, alignItems: 'center' },
  handle: { width: 36, height: 4, borderRadius: 2, opacity: 0.4 },
  header: { padding: 16 },
  headerTitle: { fontSize: 14, fontWeight: '500' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  icon: { width: 40, alignItems: 'center', marginRight: 12 },
  label: { flex: 1, fontSize: 16 },
});

Dropdown.displayName = 'Dropdown';
export default Dropdown;
