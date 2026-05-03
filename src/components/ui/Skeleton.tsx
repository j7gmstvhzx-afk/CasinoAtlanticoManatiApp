import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radius } from '@/theme';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
  rounded?: keyof typeof radius;
};

export function Skeleton({ width = '100%', height = 16, style, rounded = 'sm' }: Props) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[{ width: width as any, height, borderRadius: radius[rounded] }, styles.base, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius[rounded] },
          animated,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bg.elevated,
    overflow: 'hidden',
  },
});
