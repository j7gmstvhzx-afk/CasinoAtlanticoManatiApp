import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, StyleSheet,
  TextInput, View, useWindowDimensions,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Text } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { palette } from '@/theme';

const CHIP_BLUE      = palette.chipBlue;
const CHIP_BLUE_DARK = palette.chipBlueDark;
const CHIP_BLUE_MID  = palette.chipBlueMid;

const NAVY   = '#1a2332';
const NAVY2  = '#243042';
const NAVY3  = '#0f1922';
const GOLD   = '#c89b63';
const WHITE  = '#ffffff';
const OFFWHITE = '#f7f9fc';
const DARK_TEXT = '#1a2332';
const MUTED_TEXT = '#6b7a8d';
const BORDER = '#dde3ec';

const FEATURES = [
  { icon: '📊', text: '285 máquinas en 44 bancos monitoreadas en tiempo real' },
  { icon: '💰', text: 'Avg Coin-In PD, Avg Win PD y WWCJPR por máquina y banco' },
  { icon: '📋', text: 'Historial de cambios, movimientos y datos del período' },
];

export default function LoginScreen() {
  const session = useAuthStore(s => s.session);
  const signIn  = useAuthStore(s => s.signIn);
  const { width } = useWindowDimensions();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [busy,     setBusy]     = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass,  setFocusPass]  = useState(false);

  if (session) return <Redirect href="/" />;

  const wide = width >= 720;

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
      <View style={[styles.container, wide && styles.containerWide]}>

        {/* ── Brand panel (left on wide screens) ────────────────────────── */}
        <View style={[styles.brand, wide && styles.brandWide]}>
          {/* Decorative background shapes */}
          <View style={styles.bgCircle1} pointerEvents="none" />
          <View style={styles.bgCircle2} pointerEvents="none" />

          {/* Logo row — chip icon + wordmark */}
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <View style={styles.logoChipRing}>
                <Text style={styles.logoText}>CA</Text>
              </View>
            </View>
            <View>
              <Text style={styles.logoName}>Casino Atlántico</Text>
              <Text style={styles.logoCity}>MANATÍ · PUERTO RICO</Text>
            </View>
          </View>

          {/* Eyebrow + headline */}
          <View style={styles.heroBlock}>
            <Text style={styles.eyebrow}>PLATAFORMA OPERATIVA DE PISO</Text>
            <Text style={styles.headline}>Analítica{'\n'}del piso de{'\n'}tragamonedas.</Text>
            <Text style={styles.subline}>
              Rendimiento diario, rankings de bancos y gestión de equipos en un solo lugar.
            </Text>
          </View>

          {/* Feature list */}
          <View style={styles.featureList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <Text style={styles.brandFooter}>Uso interno · Acceso restringido</Text>
        </View>

        {/* ── Form panel (right on wide screens) ────────────────────────── */}
        <View style={[styles.formSide, wide && styles.formSideWide]}>
          <View style={[styles.formCard, wide && styles.formCardWide]}>
            <View style={styles.formTop}>
              <Text style={styles.welcome}>BIENVENIDO</Text>
              <Text style={styles.formTitle}>Iniciar sesión</Text>
              <Text style={styles.formSub}>
                Usa tu correo y contraseña asignados por el administrador.
              </Text>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Correo electrónico</Text>
              <TextInput
                style={[styles.input, focusEmail && styles.inputFocus, error ? styles.inputError : null]}
                value={email}
                onChangeText={t => { setEmail(t); setError(null); }}
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
                placeholder="usuario@casino.com"
                placeholderTextColor={MUTED_TEXT}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <TextInput
                style={[styles.input, focusPass && styles.inputFocus, error ? styles.inputError : null]}
                value={password}
                onChangeText={t => { setPassword(t); setError(null); }}
                onFocus={() => setFocusPass(true)}
                onBlur={() => setFocusPass(false)}
                placeholder="••••••••"
                placeholderTextColor={MUTED_TEXT}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.btn, busy && styles.btnBusy, pressed && styles.btnPressed]}
              onPress={handleLogin}
              disabled={busy}
            >
              {busy ? (
                <View style={styles.busyRow}>
                  <View style={styles.busyDot} />
                  <View style={[styles.busyDot, { opacity: 0.5 }]} />
                  <View style={[styles.busyDot, { opacity: 0.25 }]} />
                </View>
              ) : (
                <Text style={styles.btnText}>Entrar al sistema</Text>
              )}
            </Pressable>

            <Text style={styles.helpText}>
              ¿Problemas para entrar? Contacta al administrador del sistema.
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAVY },

  container: {
    flex: 1,
    flexDirection: 'column',
  },
  containerWide: {
    flexDirection: 'row',
  },

  // ── Brand panel ──────────────────────────────────────────────────────────────
  brand: {
    backgroundColor: CHIP_BLUE,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: 'center',
    gap: 28,
    overflow: 'hidden',
  },
  brandWide: {
    flex: 55,
    paddingLeft: 60,
    paddingRight: 48,
    justifyContent: 'center',
  },

  bgCircle1: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: CHIP_BLUE_MID + '30',
    top: -140,
    right: -140,
  },
  bgCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: CHIP_BLUE_DARK + '55',
    bottom: -80,
    left: -80,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  // Outer chip ring
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Inner chip ring
  logoChipRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 15,
    fontWeight: '900',
    color: WHITE,
    letterSpacing: 1.2,
  },
  logoName: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
  logoCity: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.5,
    marginTop: 2,
  },

  heroBlock: { gap: 12 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: GOLD + '99',
    letterSpacing: 2,
  },
  headline: {
    fontSize: 36,
    fontWeight: '900',
    color: WHITE,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subline: {
    fontSize: 14,
    color: WHITE + '88',
    lineHeight: 22,
    maxWidth: 360,
  },

  featureList: { gap: 10 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
    marginTop: 5,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 13,
    color: WHITE + 'bb',
    lineHeight: 20,
    flex: 1,
  },

  brandFooter: {
    fontSize: 11,
    color: WHITE + '33',
    letterSpacing: 0.5,
  },

  // ── Form panel ───────────────────────────────────────────────────────────────
  formSide: {
    flex: 1,
    backgroundColor: OFFWHITE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  formSideWide: {
    flex: 45,
    backgroundColor: WHITE,
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    gap: 20,
  },
  formCardWide: {
    maxWidth: 400,
  },

  formTop: { gap: 6, marginBottom: 4 },
  welcome: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 2,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: DARK_TEXT,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  formSub: {
    fontSize: 14,
    color: MUTED_TEXT,
    lineHeight: 20,
    marginTop: 4,
  },

  field: { gap: 7 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  input: {
    backgroundColor: WHITE,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: DARK_TEXT,
    fontSize: 15,
  },
  inputFocus: {
    borderColor: CHIP_BLUE,
  },
  inputError: {
    borderColor: '#e74c3c55',
    backgroundColor: '#fff5f5',
  },

  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f5c6c6',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 13,
    textAlign: 'center',
  },

  btn: {
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: CHIP_BLUE,
    alignItems: 'center',
    marginTop: 4,
  },
  btnBusy: {
    backgroundColor: CHIP_BLUE_DARK,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  busyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    height: 22,
  },
  busyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WHITE,
  },

  helpText: {
    fontSize: 12,
    color: MUTED_TEXT,
    textAlign: 'center',
    lineHeight: 18,
  },
});
