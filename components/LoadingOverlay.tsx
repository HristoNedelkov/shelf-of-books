import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Text, Colors } from 'react-native-ui-lib';
import { BookOpen } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({
  visible,
  message = 'Зареждане...',
}: LoadingOverlayProps) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(360, { duration: 2000, easing: Easing.linear })
        ),
        -1
      );
    } else {
      rotation.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.blur}>
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <BookOpen size={48} color={Colors.blue30} />
          </Animated.View>
          <Text style={styles.message}>{message}</Text>
          <ActivityIndicator
            size="large"
            color={Colors.blue30}
            style={styles.spinner}
          />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  blur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.grey40,
    marginBottom: 16,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 8,
  },
});
