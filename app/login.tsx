import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Text } from '@/components/ui';
import { spacing, radius } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';

const NAVY = '#1a2332';
const GOLD = '#d4a574';
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
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoChar}>CA</Text>
          </View>
        </View>

        <Text style={styles.title}>Casino Atlántico</Text>
        <Text style={styles.subtitle}>PLATAFORMA OPERATIVA · MANATÍ</Text>

        {/* Fields */}
        <View style={styles.fields}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            placeholderTextColor="#94a3b8"
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
            placeholderTextColor="#94a3b8"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={busy}
        >
          <Text style={styles.btnText}>
            {busy ? 'Verificando...' : 'Iniciar sesión'}
          </Text>
        </Pressable>

        <Text style={styles.hint}>Acceso restringido al personal autorizado.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 8,
  },
  logoWrap:   { marginBottom: spacing.sm },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoChar: {
    fontFamily: "'Playfair Display', Georgia, serif",
    color: GOLD,
    fontWeight: '800',
    fontSize: 24,
    letterSpacing: 1,
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 24,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: TEAL,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  fields: { width: '100%', gap: spacing.md },
  input: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: NAVY,
    fontSize: 15,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
  btn: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: NAVY,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
