import React, { useEffect } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge, Button, Card, Header, Screen, SectionHeader, Text } from '@/components/ui';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { registerForPushNotifications } from '@/services/pushNotifications';
import { api } from '@/services/api';
import { colors, palette, radius, spacing } from '@/theme';
import type { GameTable } from '@/types/domain';

const ADDRESS = 'Casino Atlántico Manatí, PR';
const MAPS_URL = Platform.select({
  ios: 'http://maps.apple.com/?q=Casino+Atl%C3%A1ntico+Manati',
  android: 'geo:0,0?q=Casino+Atl%C3%A1ntico+Manati',
  default: 'https://maps.google.com/?q=Casino+Atl%C3%A1ntico+Manati',
}) as string;

const HOURS = [
  { day: 'Lunes - Jueves', hours: '12:00 PM – 2:00 AM' },
  { day: 'Viernes - Sábado', hours: '12:00 PM – 4:00 AM' },
  { day: 'Domingo', hours: '12:00 PM – 12:00 AM' },
];

const open = async (url: string) => {
  Haptics.selectionAsync();
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('No se pudo abrir', url);
  }
};

export default function InfoScreen() {
  const prefs = usePreferencesStore();
  const [tables, setTables] = React.useState<GameTable[]>([]);

  useEffect(() => {
    api.getTables().then(setTables);
  }, []);

  const togglePush = async (next: boolean) => {
    prefs.setPushEnabled(next);
    if (next && !prefs.pushToken) {
      const token = await registerForPushNotifications();
      if (token) prefs.setPushToken(token);
      else
        Alert.alert(
          'Notificaciones no activadas',
          'Ve a Ajustes del sistema y permite las notificaciones para Casino Atlántico.',
        );
    }
  };

  return (
    <Screen>
      <Header title="Información" subtitle="Casino Atlántico Manatí" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notificaciones — primera sección, prioritaria */}
        <Animated.View entering={FadeInDown.duration(360)} style={styles.padded}>
          <Card variant="elevated" style={{ gap: spacing.md }}>
            <View style={styles.iconHeader}>
              <View style={[styles.iconBubble, { backgroundColor: 'rgba(245,201,122,0.15)' }]}>
                <Ionicons name="notifications" size={20} color={colors.brand.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="h3">Notificaciones</Text>
                <Text variant="small" tone="muted">
                  Recibe alertas cuando publiquemos nuevos premios, promociones y eventos.
                </Text>
              </View>
            </View>
            <View style={styles.toggleRow}>
              <Text variant="body">Activar notificaciones push</Text>
              <Switch
                value={prefs.pushEnabled}
                onValueChange={togglePush}
                trackColor={{ false: '#444', true: colors.brand.gold }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.toggleRow}>
              <Text variant="body">Promociones por correo</Text>
              <Switch
                value={prefs.marketingEnabled}
                onValueChange={prefs.setMarketingEnabled}
                trackColor={{ false: '#444', true: colors.brand.gold }}
                thumbColor="#fff"
              />
            </View>
            {prefs.pushToken ? (
              <Badge label="Dispositivo registrado" tone="success" showDot />
            ) : null}
          </Card>
        </Animated.View>

        {/* Contacto */}
        <Animated.View entering={FadeInDown.delay(60).duration(360)}>
          <SectionHeader title="Contacto" caption="Estamos para servirte" />
          <View style={styles.padded}>
            <Card variant="elevated" padded={false}>
              <ContactRow
                icon="logo-whatsapp"
                tint="#25D366"
                title="WhatsApp"
                subtitle="Atención al cliente"
                onPress={() => open('https://wa.me/17875552200')}
              />
              <Divider />
              <ContactRow
                icon="megaphone"
                tint={colors.brand.gold}
                title="Canal de WhatsApp"
                subtitle="Recibe ofertas en tu chat"
                onPress={() => open('https://whatsapp.com/channel/0029Va')}
              />
              <Divider />
              <ContactRow
                icon="call"
                tint="#6EA0E6"
                title="Llamar"
                subtitle="787-555-2200"
                onPress={() => open('tel:+17875552200')}
              />
              <Divider />
              <ContactRow
                icon="mail"
                tint="#B095FF"
                title="Correo"
                subtitle="info@casinoatlantico.com"
                onPress={() => open('mailto:info@casinoatlantico.com')}
              />
              <Divider />
              <ContactRow
                icon="logo-facebook"
                tint="#1877F2"
                title="Facebook"
                subtitle="Síguenos para enterarte de todo"
                onPress={() => open('https://facebook.com/casinoatlantico')}
              />
              <Divider />
              <ContactRow
                icon="logo-instagram"
                tint="#E4405F"
                title="Instagram"
                subtitle="@casinoatlanticomanati"
                onPress={() => open('https://instagram.com/casinoatlanticomanati')}
              />
            </Card>
          </View>
        </Animated.View>

        {/* Localización */}
        <Animated.View entering={FadeInDown.delay(120).duration(360)}>
          <SectionHeader title="Cómo llegar" caption="Manatí, Puerto Rico" />
          <View style={styles.padded}>
            <Card variant="elevated" padded={false} style={styles.mapCard}>
              <View style={styles.mapPreview}>
                <View style={styles.mapPin}>
                  <Ionicons name="location" size={28} color="#fff" />
                </View>
                <Text variant="bodyStrong" align="center">
                  Casino Atlántico Manatí
                </Text>
                <Text variant="small" tone="muted" align="center">
                  Manatí, Puerto Rico
                </Text>
              </View>
              <View style={{ padding: spacing.lg }}>
                <Button
                  label="Abrir en Mapas"
                  variant="gold"
                  fullWidth
                  leading={<Ionicons name="navigate" size={18} color={palette.midnight} />}
                  onPress={() => open(MAPS_URL)}
                />
              </View>
            </Card>
          </View>
        </Animated.View>

        {/* Horario */}
        <Animated.View entering={FadeInDown.delay(180).duration(360)}>
          <SectionHeader title="Horario" />
          <View style={styles.padded}>
            <Card variant="elevated" padded={false}>
              {HOURS.map((h, idx) => (
                <View key={h.day}>
                  <View style={styles.hourRow}>
                    <Text variant="body">{h.day}</Text>
                    <Text variant="bodyStrong" tone="gold">
                      {h.hours}
                    </Text>
                  </View>
                  {idx < HOURS.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </Card>
          </View>
        </Animated.View>

        {/* Mesas de juego */}
        <Animated.View entering={FadeInDown.delay(240).duration(360)}>
          <SectionHeader title="Mesas de juego" caption="Disponibles a diario" />
          <View style={styles.padded}>
            <Card variant="elevated" padded={false}>
              {tables.map((t, idx) => (
                <View key={t.id}>
                  <View style={styles.tableRow}>
                    <View style={[styles.iconBubble, { backgroundColor: 'rgba(110,160,230,0.12)' }]}>
                      <Ionicons name="cafe" size={18} color="#6EA0E6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong">{t.name}</Text>
                      <Text variant="small" tone="muted">
                        {t.description}
                      </Text>
                    </View>
                    {t.minBet ? (
                      <Text variant="caption" tone="gold">
                        DESDE ${t.minBet}
                      </Text>
                    ) : null}
                  </View>
                  {idx < tables.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </Card>
          </View>
        </Animated.View>

        {/* Términos */}
        <Animated.View entering={FadeInDown.delay(300).duration(360)} style={styles.padded}>
          <Card variant="surface" padded={false}>
            <ContactRow
              icon="document-text"
              tint={colors.text.muted}
              title="Términos de uso"
              subtitle="Ver términos y condiciones"
              onPress={() => open('https://casinoatlantico.com/terms')}
            />
            <Divider />
            <ContactRow
              icon="shield-checkmark"
              tint={colors.text.muted}
              title="Privacidad"
              subtitle="Política de privacidad"
              onPress={() => open('https://casinoatlantico.com/privacy')}
            />
          </Card>
        </Animated.View>

        <Text variant="caption" tone="muted" align="center" style={{ marginTop: spacing.md }}>
          Casino Atlántico Manatí · Versión 2.0
        </Text>
      </ScrollView>
    </Screen>
  );
}

function ContactRow({
  icon,
  tint,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.contactRow, pressed && { opacity: 0.6 }]}>
      <View style={[styles.iconBubble, { backgroundColor: `${tint}20` }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="small" tone="muted">
          {subtitle}
        </Text>
      </View>
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
  iconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
    marginHorizontal: spacing.lg,
  },
  mapCard: { overflow: 'hidden' },
  mapPreview: {
    height: 180,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mapPin: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
