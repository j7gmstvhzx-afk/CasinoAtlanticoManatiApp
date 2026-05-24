import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Header, Screen } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { SegmentedControl } from '@/components/slotfloor/SegmentedControl';
import { FloorOverview }   from '@/components/slotfloor/FloorOverview';
import { BetAnalysis }     from '@/components/slotfloor/BetAnalysis';
import { CoinInSection }   from '@/components/slotfloor/CoinInSection';
import { MachineChanges }  from '@/components/slotfloor/MachineChanges';
import { MachineExplorer } from '@/components/slotfloor/MachineExplorer';

const SECTIONS = ['Resumen', 'Apuestas', 'Coin-In', 'Cambios', 'Explorar'] as const;

const SECTION_COMPONENTS = [
  FloorOverview,
  BetAnalysis,
  CoinInSection,
  MachineChanges,
  MachineExplorer,
] as const;

export default function SlotFloorScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const init        = useSlotFloorStore(s => s.init);
  const initialized = useSlotFloorStore(s => s.initialized);

  useEffect(() => { init(); }, [init]);

  const ActiveSection = SECTION_COMPONENTS[activeIndex];

  return (
    <Screen>
      <Header
        title="Piso de Máquinas"
        subtitle="Casino Atlántico Manatí"
      />
      <SegmentedControl
        segments={SECTIONS}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
      <View style={styles.body}>
        {initialized ? (
          <Animated.View key={activeIndex} entering={FadeIn.duration(220)} style={styles.section}>
            <ActiveSection />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.loading}>
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body:    { flex: 1 },
  section: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
