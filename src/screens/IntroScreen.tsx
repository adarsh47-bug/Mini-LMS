/**
 * IntroScreen
 *
 * Welcome / landing screen shown to unauthenticated users.
 * Provides navigation to login and register.
 */

import { ThemedButton } from '@/src/components';
import { LOGO, NAME } from '@/src/constants';
import { useTheme } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
  { icon: 'book-outline' as const, label: 'Curated Courses' },
  { icon: 'play-circle-outline' as const, label: 'Video Lessons' },
  { icon: 'trophy-outline' as const, label: 'Track Progress' },
  { icon: 'people-outline' as const, label: 'Community' },
];

const IntroScreen = () => {
  const { colors } = useTheme();

  const handleLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, []);

  const handleRegister = useCallback(() => {
    router.push('/(auth)/register');
  }, []);

  return (
    <SafeAreaView className="flex-1 px-6" style={{ backgroundColor: colors.background }}>
      {/* Hero Section */}
      <View className="items-center mt-6 mb-8">
        <Image
          source={LOGO}
          style={{ width: 96, height: 96, borderRadius: 24, marginBottom: 16 }}
          contentFit="contain"
          transition={200}
        />
        <Text className="text-3xl font-extrabold mb-2" style={{ color: colors.text }}>
          {NAME}
        </Text>
        <Text className="text-base text-center leading-6" style={{ color: colors.textSecondary }}>
          Your pocket learning companion.{'\n'}Learn anytime, anywhere.
        </Text>
      </View>

      {/* Feature Grid */}
      <View className="flex-row flex-wrap justify-between mb-8">
        {FEATURES.map((feat) => (
          <View
            key={feat.label}
            className="w-[48%] py-5 px-4 rounded-2xl items-center mb-3"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <Ionicons name={feat.icon} size={28} color={colors.primary} />
            <Text className="text-sm font-semibold mt-2" style={{ color: colors.text }}>
              {feat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* CTA Buttons */}
      <View className="mt-auto gap-2 pb-4">
        <ThemedButton title="Get Started" onPress={handleRegister} size="lg" />
        <ThemedButton
          title="I already have an account"
          onPress={handleLogin}
          variant="outline"
          size="md"
        />
      </View>
    </SafeAreaView>
  );
};

export default IntroScreen;
