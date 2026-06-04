import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, StyleSheet,
  TextInput, View, useWindowDimensions,
} from 'react-native';
import { Redirect } from 'expo-router';
import { Text } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';

const NAVY   = '#1a2332';
const NAVY2  = '#243042';
const GOLD   = '#d4a574';
const GOLD2  = '#c89b63';
const WHITE  = '#ffffff';

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

        {/* ── Brand panel (left on wide, top on narrow) ─────────────────── */}
        <View style={[styles.brand, wide && styles.brandWide]}>
          {/* Monogram */}
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>CA</Text>
          </View>

          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>Casino</Text>
            <Text style={styles.brandTitle}>Atlántico</Text>
            <View style={styles.goldDivider} />
            <Text style={styles.brandSub}>MANATÍ · PUERTO RICO</Text>
          </View>

          <Text style={styles.brandTagline}>PLATAFORMA OPERATIVA DE PISO</Text>

          {/* Decorative gold sheen circles */}
          <View style={styles.sheen1} pointerEvents="none" />
          <View style={styles.sheen2} pointerEvents="none" />
        </View>

        {/* ── Form panel (right on wide, bottom on narrow) ───────────────── */}
        <View style={[styles.formWrapper, wide && styles.formWrapperWide]}>
          <View style={[styles.glassCard, wide && styles.glassCardWide]}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            <Text style={styles.formSubtitle}>Acceso restringido al personal autorizado</Text>

            {/* Email field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
              <TextInput
                style={[styles.input, focusEmail && styles.inputFocus]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
                placeholder="usuario@casino.com"
                placeholderTextColor="#9ba8b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              {focusEmail && <View style={styles.focusLine} />}
            </View>

            {/* Password field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
              <TextInput
                style={[styles.input, focusPass && styles.inputFocus]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusPass(true)}
                onBlur={() => setFocusPass(false)}
                placeholder="••••••••"
                placeholderTextColor="#9ba8b8"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              {focusPass && <View style={styles.focusLine} />}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[styles.btn, busy && styles.btnBusy]}
              onPress={handleLogin}
              disabled={busy}
            >
              {busy ? (
                <View style={styles.btnBusyRow}>
                  <View style={styles.busyDot} />
                  <View style={[styles.busyDot, { opacity: 0.6 }]} />
                  <View style={[styles.busyDot, { opacity: 0.3 }]} />
                </View>
              ) : (
                <Text style={styles.btnText}>Entrar al Sistema</Text>
              )}
            </Pressable>

            <Text style={styles.hint}>Casino Atlántico Manatí · Uso Interno</Text>
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
    backgroundColor: NAVY,
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    overflow: 'hidden',
  },
  brandWide: {
    flex: 55,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 60,
  },
  monogram: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: GOLD + '55',
    backgroundColor: NAVY2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  monogramText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 36,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 2,
  },
  brandText: { gap: 2 },
  brandTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 40,
    fontWeight: '900',
    color: WHITE,
    letterSpacing: -0.5,
    lineHeight: 46,
  },
  goldDivider: {
    width: 56,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginTop: 10,
    marginBottom: 8,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD + 'bb',
    letterSpacing: 2.5,
  },
  brandTagline: {
    fontSize: 11,
    fontWeight: '600',
    color: WHITE + '55',
    letterSpacing: 1.5,
  },
  sheen1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: GOLD + '0a',
    top: -80,
    right: -80,
    transform: [{ scaleX: 1.4 }],
  },
  sheen2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: GOLD + '06',
    bottom: -40,
    left: -40,
  },

  // ── Form panel ───────────────────────────────────────────────────────────────
  formWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: NAVY + 'cc',
  },
  formWrapperWide: {
    flex: 45,
    backgroundColor: NAVY2,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GOLD + '33',
    padding: 32,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 12,
  },
  glassCardWide: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  formTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 26,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 13,
    color: WHITE + '66',
    marginTop: -10,
  },

  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: GOLD + 'aa',
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: WHITE + '22',
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: WHITE,
    fontSize: 15,
  },
  inputFocus: {
    borderColor: GOLD + '66',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  focusLine: {
    height: 2,
    backgroundColor: GOLD,
    borderRadius: 1,
    marginTop: -1,
  },

  errorText: {
    color: '#fc8181',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -8,
  },

  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: NAVY,
    borderWidth: 1,
    borderColor: GOLD + '55',
    alignItems: 'center',
    marginTop: 4,
  },
  btnBusy: {
    backgroundColor: NAVY2,
    borderColor: GOLD + '33',
  },
  btnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnBusyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    height: 22,
  },
  busyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
  },

  hint: {
    fontSize: 11,
    color: WHITE + '44',
    textAlign: 'center',
  },
});
