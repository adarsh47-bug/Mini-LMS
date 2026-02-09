import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ANIMATION_DURATION = 250;
const SPRING_CONFIG = { damping: 20, stiffness: 300 };

export function useDropdownAnimations(
  visible: boolean,
  onDismissFinish: () => void
) {
  const backdropOpacity = useSharedValue(0);
  const menuTranslateY = useSharedValue(SCREEN_HEIGHT);
  const dragY = useSharedValue(0);

  // Visibility-driven animation controller (UI thread)
  useAnimatedReaction(
    () => visible,
    (isVisible) => {
      if (isVisible) {
        dragY.value = 0;
        backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
        menuTranslateY.value = withSpring(0, SPRING_CONFIG);
      } else {
        backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION });
        menuTranslateY.value = withTiming(
          SCREEN_HEIGHT,
          { duration: ANIMATION_DURATION },
          (finished) => {
            if (finished) {
              runOnJS(onDismissFinish)();
            }
          }
        );
      }
    }
  );

  const translateY = useDerivedValue(() => {
    return menuTranslateY.value + dragY.value;
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    backdropOpacity,
    dragY,
    menuTranslateY,
    backdropStyle,
    menuStyle,
  };
}
