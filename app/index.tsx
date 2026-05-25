import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Header, Screen, Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SegmentedControl } from '@/components/slotfloor/SegmentedControl';
import { FloorOverview }   from '@/components/slotfloor/FloorOverview';
import { BetAnalysis }     from '@/components/slotfloor/BetAnalysis';
import { CoinInSection }   from '@/components/slotfloor/CoinInSection';
import { MachineChanges }  from '@/components/slotfloor/MachineChanges';
import { MachineExplorer } from '@/components/slotfloor/MachineExplorer';
import { colors, spacing } from '@/theme';

const SECTIONS = ['Resumen', 'Apuestas', 'Coin-In', 'Cambios', 'Explorar'] as const;
const SECTION_COMPONENTS = [
  FloorOverview, BetAnalysis, CoinInSection, MachineChanges, MachineExplorer,
] as const;

export default function OperationsScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const init        = useSlotFloorStore(s => s.init);
  const initialized = useSlotFloorStore(s => s.initialized);
  const profile     = useAuthStore(s => s.profile);
  const signOut     = useAuthStore(s => s.signOut);

  useEffect(() => { init(); }, [init]);

  const safeIndex   = Math.min(activeIndex, SECTION_COMPONENTS.length - 1);
  const ActiveSection = SECTION_COMPONENTS[safeIndex];

  return (
    <Screen>
      <Header
        title="Piso de Máquinas"
        subtitle="Casino Atlántico Manatí"
        rightSlot={
          <View style={styles.userArea}>
            {profile && (
              <Text variant="caption" style={profile.role === 'admin' ? styles.adminTag : styles.viewerTag}>
                {profile.role.toUpperCase()}
              </Text>
            )}
            <Pressable onPress={signOut} hitSlop={8}>
              <Ionicons name="log-out-outline" size={22} color={colors.text.muted} />
            </Pressable>
          </View>
        }
      />

      <SegmentedControl
        segments={SECTIONS}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />

      <View style={styles.body}>
        {initialized ? (
          <Animated.View key={safeIndex} entering={FadeIn.duration(220)} style={styles.section}>
            <ActiveSection />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.loading}>
            <ActivityIndicator size="large" color="#2a9d8f" />
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userArea:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  adminTag:  { color: '#2a9d8f', fontWeight: '700', letterSpacing: 0.5 },
  viewerTag: { color: '#D4A24C', fontWeight: '700', letterSpacing: 0.5 },
  body:       { flex: 1 },
  section:    { flex: 1 },
  loading:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
