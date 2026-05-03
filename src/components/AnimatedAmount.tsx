import React, { useEffect, useRef } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TextInput } from 'react-native';
import { formatCurrency } from '@/utils/format';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type Props = {
  value: number;
  style?: TextStyle | TextStyle[];
  duration?: number;
};

/**
 * Smoothly counts up to the target value. Uses an animated TextInput so the
 * native side updates without React re-renders for each frame.
 */
export function AnimatedAmount({ value, style, duration = 800 }: Props) {
  const display = useSharedValue(value);
  const previous = useRef(value);

  useEffect(() => {
    display.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
    previous.current = value;
  }, [value, duration, display]);

  const animatedProps = useAnimatedProps(() => {
    return { text: formatCurrency(display.value), defaultValue: formatCurrency(display.value) } as any;
  });

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      animatedProps={animatedProps}
      style={[{ padding: 0, margin: 0 }, style as any]}
    />
  );
}
