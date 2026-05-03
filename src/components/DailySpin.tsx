import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { colors, radius, spacing, shadow } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  available: boolean;
  streak: number;
  onSpin?: () => void;
  spinning?: boolean;
  lastReward?: string;
};

export function DailySpin({ available, streak, onSpin, spinning, lastReward }: Props) {
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (spinning) {
      rotate.value = withRepeat(withTiming(720, { duration: 1200, easing: Easing.linear }), -1);
    } else {
      rotate.value = withTiming(0);
    }
  }, [spinning, rotate]);

  useEffect(() => {
    if (available) {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 1100 }), withTiming(0, { duration: 1100 })),
        -1,
      );
    }
  }, [available, pulse]);

  const animatedSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value}deg` }] }));
  const animatedGlow = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.5 }));

  return (
    <View style={[styles.root, shadow.gold]}>
      <LinearGradient colors={['#1F1424', '#3A1F4B']} style={StyleSheet.absoluteFill} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#F5C97A', opacity: 0 },
          animatedGlow,
        ]}
      />
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="caption" tone="gold">
            GIRO DIARIO · RACHA {streak}🔥
          </Text>
          <Text variant="h2" style={{ color: '#fff' }}>
            ¡Gira y gana!
          </Text>
          <Text variant="small" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {lastReward
              ? `Última recompensa: ${lastReward}`
              : available
              ? 'Tu giro de hoy te espera. Reclama puntos al instante.'
              : 'Vuelve mañana para tu próximo giro gratis.'}
          </Text>
        </View>
        <AnimatedPressable
          onPress={() => {
            if (!available || spinning) return;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSpin?.();
          }}
          style={styles.wheelWrap}
        >
          <Animated.View style={[styles.wheel, animatedSpin]}>
            <Ionicons name="star" size={32} color="#FFE7AF" />
          </Animated.View>
          <Text variant="caption" tone="gold" align="center" style={{ marginTop: 6 }}>
            {spinning ? 'GIRANDO...' : available ? 'TOCA PARA GIRAR' : 'EN ESPERA'}
          </Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.gold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  wheelWrap: {
    width: 120,
    alignItems: 'center',
  },
  wheel: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245,201,122,0.2)',
    borderWidth: 3,
    borderColor: '#FFE7AF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
