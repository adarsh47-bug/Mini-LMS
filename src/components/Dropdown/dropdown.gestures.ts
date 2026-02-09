import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DISMISS_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;
const SPRING_CONFIG = { damping: 20, stiffness: 300 };

export function useDropdownGesture({
  dragY,
  backdropOpacity,
  menuTranslateY,
  onClose,
}: {
  dragY: any;
  backdropOpacity: any;
  menuTranslateY: any;
  onClose: () => void;
}) {
  return Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        dragY.value = event.translationY;
        const progress = Math.min(event.translationY / DISMISS_THRESHOLD, 1);
        backdropOpacity.value = 1 - progress * 0.5;
      }
    })
    .onEnd((event) => {
      const shouldDismiss =
        event.translationY > DISMISS_THRESHOLD ||
        event.velocityY > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        backdropOpacity.value = withTiming(0, { duration: 200 });
        menuTranslateY.value = withTiming(
          SCREEN_HEIGHT,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(onClose)();
            }
          }
        );
      } else {
        dragY.value = withSpring(0, SPRING_CONFIG);
        backdropOpacity.value = withTiming(1, { duration: 150 });
      }
    });
}
