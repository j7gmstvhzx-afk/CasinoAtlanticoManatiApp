import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Props = {
  expanded: boolean;
  size?: number;
  color: string;
};

// Single chevron-down glyph that smoothly rotates 180° when `expanded`
// flips, instead of swapping between two static icons.
export function AnimatedChevron({ expanded, size = 16, color }: Props) {
  const rotation = useSharedValue(expanded ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(expanded ? 180 : 0, { duration: 200 });
  }, [expanded, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name="chevron-down" size={size} color={color} />
    </Animated.View>
  );
}
