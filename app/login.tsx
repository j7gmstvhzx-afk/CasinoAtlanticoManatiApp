import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Text } from '@/components/ui';
import { colors, spacing, radius, palette } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';

const TEAL = '#2a9d8f';

export default function LoginScreen() {
  const session = useAuthStore(s => s.session);
  const signIn  = useAuthStore(s => s.signIn);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [busy,     setBusy]     = useState(false);

  if (session) return <Redirect href="/" />;

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setBusy(true);
    setError(null);
    const err = await signIn(email.trim().toLowerCase(), password);
    if (err) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        {/* Logo area */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text variant="display" style={styles.logoChar}>CA</Text>
          </View>
        </View>

        <Text variant="h1" style={styles.title}>Casino Atlántico</Text>
        <Text variant="caption" style={styles.subtitle}>PLATAFORMA OPERATIVA · MANATÍ</Text>

        {/* Inputs */}
        <View style={styles.fields}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            placeholderTextColor={colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor={colors.text.muted}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>

        {error && (
          <Text variant="caption" style={styles.errorText}>{error}</Text>
        )}

        <Pressable
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={busy}
        >
          <Text variant="bodyStrong" style={{ color: '#fff' }}>
            {busy ? 'Verificando...' : 'Iniciar sesión'}
          </Text>
        </Pressable>

        <Text variant="caption" tone="muted" align="center" style={styles.hint}>
          Acceso restringido al personal autorizado.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.midnight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  logoWrap:   { marginBottom: spacing.sm },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEAL + '22',
    borderWidth: 2,
    borderColor: TEAL + '66',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoChar:  { color: TEAL, fontWeight: '800', fontSize: 24 },
  title:     { fontWeight: '700', textAlign: 'center' },
  subtitle:  { color: TEAL, letterSpacing: 1.2, textAlign: 'center', marginBottom: spacing.md },
  fields:    { width: '100%', gap: spacing.md },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: 15,
  },
  errorText: {
    color: '#E5484D',
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
  btn: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: TEAL,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.55 },
  hint: { marginTop: spacing.sm },
});
