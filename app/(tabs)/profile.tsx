import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge, Button, Card, Header, Screen, Text } from '@/components/ui';
import { useUserStore } from '@/store/useUserStore';
import { colors, radius, spacing } from '@/theme';
import { formatNumber, tierLabel } from '@/utils/format';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [marketing, setMarketing] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);

  return (
    <Screen>
      <Header title="Perfil" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.padded}>
          <Card variant="elevated" style={styles.identity}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={colors.text.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="h2">{user.displayName}</Text>
              <Text variant="small" tone="muted">
                {user.email ?? 'Cuenta de invitado'}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <Badge label={`Club ${tierLabel[user.tier]}`} tone="gold" showDot />
                <Badge label={`${formatNumber(user.points)} pts`} tone="info" />
              </View>
            </View>
          </Card>
        </Animated.View>

        {user.isGuest ? (
          <Animated.View entering={FadeInDown.delay(60).duration(360)} style={styles.padded}>
            <Card variant="gold" style={{ gap: spacing.sm }}>
              <Text variant="h3" tone="inverse">
                Crea tu cuenta gratis
              </Text>
              <Text variant="small" tone="inverse">
                Acumula puntos, recibe ofertas exclusivas y reserva mesas VIP.
              </Text>
              <Button
                label="Crear cuenta o iniciar sesión"
                variant="primary"
                fullWidth
                onPress={() => router.push('/auth')}
              />
            </Card>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(120).duration(360)} style={styles.padded}>
          <Card variant="elevated" padded={false}>
            <Row icon="notifications" label="Notificaciones push">
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#444', true: colors.brand.gold }}
                thumbColor="#fff"
              />
            </Row>
            <Divider />
            <Row icon="megaphone" label="Promociones por correo">
              <Switch
                value={marketing}
                onValueChange={setMarketing}
                trackColor={{ false: '#444', true: colors.brand.gold }}
                thumbColor="#fff"
              />
            </Row>
            <Divider />
            <Row icon="phone-portrait" label="Vibración háptica">
              <Switch
                value={haptics}
                onValueChange={setHaptics}
                trackColor={{ false: '#444', true: colors.brand.gold }}
                thumbColor="#fff"
              />
            </Row>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(360)} style={styles.padded}>
          <Card variant="elevated" padded={false}>
            <LinkRow icon="diamond" label="Mi historial de jugadas" onPress={() => {}} />
            <Divider />
            <LinkRow icon="receipt" label="Premios canjeados" onPress={() => {}} />
            <Divider />
            <LinkRow icon="information-circle" label="Información y horario" onPress={() => {}} />
            <Divider />
            <LinkRow icon="bookmark" label="Términos de Uso" onPress={() => {}} />
            <Divider />
            <LinkRow icon="help-circle" label="Soporte" onPress={() => {}} />
          </Card>
        </Animated.View>

        {!user.isGuest ? (
          <View style={styles.padded}>
            <Button label="Cerrar sesión" variant="outline" fullWidth onPress={logout} />
          </View>
        ) : null}

        <Text variant="caption" tone="muted" align="center">
          Casino Atlántico Manatí · Versión 2.0
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.text.gold} />
      </View>
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.text.gold} />
      </View>
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 140,
    gap: spacing.lg,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245,201,122,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.gold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,201,122,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.lg,
  },
});
