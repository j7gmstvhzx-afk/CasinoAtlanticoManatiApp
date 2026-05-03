import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Button, Header, Screen, Text } from '@/components/ui';
import { useUserStore } from '@/store/useUserStore';
import { colors, palette, radius, spacing } from '@/theme';

export default function AuthScreen() {
  const router = useRouter();
  const loginEmail = useUserStore((s) => s.loginEmail);
  const loginGuest = useUserStore((s) => s.loginGuest);
  const loginSocial = useUserStore((s) => s.loginSocial);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<null | 'email' | 'guest' | 'google' | 'apple' | 'facebook'>(null);

  const finish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleEmail = async () => {
    if (!email.trim()) return;
    setLoading('email');
    await loginEmail(email.trim());
    setLoading(null);
    finish();
  };

  const handleSocial = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoading(provider);
    await loginSocial(provider);
    setLoading(null);
    finish();
  };

  const handleGuest = async () => {
    setLoading('guest');
    await loginGuest();
    setLoading(null);
    finish();
  };

  return (
    <Screen>
      <Header showBack title="Acceso" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.duration(360)} style={styles.hero}>
            <LinearGradient colors={[palette.atlanticDeep, palette.midnight]} style={StyleSheet.absoluteFill} />
            <View style={styles.logo}>
              <Ionicons name="diamond" size={28} color={colors.brand.goldGlow} />
            </View>
            <Text variant="h1" align="center" style={{ marginTop: spacing.md }}>
              Bienvenido al Club Atlántico
            </Text>
            <Text variant="body" tone="secondary" align="center">
              Crea tu cuenta o inicia sesión para acumular puntos y recibir ofertas exclusivas.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(80).duration(360)} style={styles.form}>
            <View style={styles.field}>
              <Ionicons name="mail-outline" size={18} color={colors.text.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={colors.text.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.text.muted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
                style={styles.input}
              />
            </View>
            <Button
              label="Continuar con email"
              variant="gold"
              fullWidth
              loading={loading === 'email'}
              onPress={handleEmail}
            />
            <Pressable hitSlop={8} style={{ alignSelf: 'center', marginTop: 6 }}>
              <Text variant="small" tone="gold">
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(140).duration(360)} style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text variant="caption" tone="muted">
              O CONTINÚA CON
            </Text>
            <View style={styles.divider} />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(360)} style={styles.socialRow}>
            <SocialButton
              icon="logo-apple"
              label="Apple"
              loading={loading === 'apple'}
              onPress={() => handleSocial('apple')}
            />
            <SocialButton
              icon="logo-google"
              label="Google"
              loading={loading === 'google'}
              onPress={() => handleSocial('google')}
            />
            <SocialButton
              icon="logo-facebook"
              label="Facebook"
              loading={loading === 'facebook'}
              onPress={() => handleSocial('facebook')}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(260).duration(360)} style={styles.guest}>
            <Button
              label="Continuar como invitado"
              variant="ghost"
              fullWidth
              loading={loading === 'guest'}
              onPress={handleGuest}
            />
            <Text variant="caption" tone="muted" align="center">
              Al continuar aceptas los Términos y la Política de Privacidad.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
  loading,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.social} disabled={loading}>
      <Ionicons name={icon} size={20} color={colors.text.primary} />
      <Text variant="bodyStrong">{loading ? '...' : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 80,
    gap: spacing.xl,
  },
  hero: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245,201,122,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.gold,
  },
  form: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.default,
  },
  socialRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  social: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
  },
  guest: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
});
