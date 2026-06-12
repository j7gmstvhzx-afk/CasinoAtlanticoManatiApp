import React from 'react';
import {
  GestureResponderEvent, Platform, Pressable, PressableProps,
  PressableStateCallbackType, StyleProp, ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Props = PressableProps & {
  // How much the element shrinks on press (1 = no shrink).
  scaleTo?: number;
  // How much the element grows on hover, web only (1 = no grow).
  hoverScale?: number;
};

const webCursor = { cursor: 'pointer' } as unknown as ViewStyle;

// Drop-in replacement for RN's Pressable that adds a quick scale-down on
// press and an optional scale-up on hover (web), so every tap/click feels
// responsive. Accepts the same `style`/`children` render-prop forms.
export function AnimatedPressable({
  style, children, scaleTo = 0.97, hoverScale = 1,
  onPressIn, onPressOut, onHoverIn, onHoverOut, ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      style={style}
      onPressIn={(e: GestureResponderEvent) => {
        scale.value = withTiming(scaleTo, { duration: 90 });
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        scale.value = withTiming(1, { duration: 150 });
        onPressOut?.(e);
      }}
      onHoverIn={(e: any) => {
        if (hoverScale !== 1) scale.value = withTiming(hoverScale, { duration: 150 });
        onHoverIn?.(e);
      }}
      onHoverOut={(e: any) => {
        scale.value = withTiming(1, { duration: 150 });
        onHoverOut?.(e);
      }}
      {...rest}
    >
      {(state: PressableStateCallbackType) => (
        <Animated.View
          style={[
            typeof style === 'function' ? style(state) : (style as StyleProp<ViewStyle>),
            animStyle,
            Platform.OS === 'web' && !rest.disabled && webCursor,
          ]}
        >
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
