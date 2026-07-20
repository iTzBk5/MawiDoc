import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  interpolate
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

// @ts-ignore
import LogoImg from '../../assets/logo-removebg-preview.png';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

export function SplashScreen() {
  const progress = useSharedValue(0);

  useEffect(() => {
    // 1.4s linear infinite animation
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    // Recreate the CSS keyframes logic:
    // stroke-dasharray: 48, 144
    // stroke-dashoffset: 192 -> 0
    // 72.5% { opacity: 0; }

    // Smooth opacity transition for a heartbeat effect
    const opacity = progress.value < 0.725 ? 1 : 0;
    const strokeDashoffset = interpolate(progress.value, [0, 1], [192, 0]);

    return {
      strokeDashoffset,
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={LogoImg} style={styles.logo} resizeMode="contain" />
        <View style={styles.loadingContainer}>
          <Svg width="64" height="48" viewBox="0 0 64 48">
            <Polyline
              points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
              fill="none"
              stroke="#FFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <AnimatedPolyline
              points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
              fill="none"
              stroke="#00A896"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="48 144"
              animatedProps={animatedProps}
            />
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 60,
  },
  loadingContainer: {
    width: 64,
    height: 48,
  }
});
