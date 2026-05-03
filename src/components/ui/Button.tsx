import React from 'react';
import { Pressable, PressableProps, StyleSheet, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from './Text';
import { colors, radius, spacing, shadow } from '@/theme';

type Variant = 'gold' | 'primary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'gold',
  size = 'md',
  leading,
  trailing,
  loading,
  fullWidth,
  haptic = true,
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.3 + glow.value * 0.4,
  }));

  const sizeStyle = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 38 },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 48 },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 56 },
  }[size];

  const tone =
    variant === 'gold' || variant === 'primary' || variant === 'danger' ? 'inverse' : 'primary';
  const labelTone = variant === 'gold' ? 'inverse' : tone;

  const Inner = (
    <>
      {leading}
      {loading ? (
        <ActivityIndicator color={variant === 'gold' ? colors.text.inverse : colors.text.primary} />
      ) : (
        <Text variant={size === 'lg' ? 'h3' : 'bodyStrong'} tone={labelTone as any}>
          {label}
        </Text>
      )}
      {trailing}
    </>
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled || loading}
      onPressIn={(e) => {
        scale.value = withSpring(0.96, { stiffness: 320, damping: 18 });
        glow.value = withTiming(1, { duration: 160 });
        if (haptic) Haptics.selectionAsync();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { stiffness: 320, damping: 18 });
        glow.value = withTiming(0, { duration: 220 });
        onPressOut?.(e);
      }}
      onPress={onPress}
      style={[
        styles.base,
        sizeStyle,
        fullWidth && { alignSelf: 'stretch' },
        variant === 'ghost' && styles.ghost,
        variant === 'outline' && styles.outline,
        variant === 'primary' && styles.primary,
        variant === 'danger' && styles.danger,
        disabled && styles.disabled,
        animated as any,
        style as any,
      ]}
    >
      {variant === 'gold' ? (
        <LinearGradient
          colors={[colors.brand.gradient[0], colors.brand.gradient[1], colors.brand.gradient[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
      ) : null}
      <View style={styles.row}>{Inner}</View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  primary: {
    backgroundColor: colors.brand.atlantic,
  },
  danger: {
    backgroundColor: colors.status.danger,
  },
  disabled: {
    opacity: 0.45,
  },
});
