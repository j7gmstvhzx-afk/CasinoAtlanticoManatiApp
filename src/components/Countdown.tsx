import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import { formatCountdown } from '@/utils/format';

type Props = {
  endsAt: string;
  compact?: boolean;
};

export function Countdown({ endsAt, compact }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds, totalSec } = formatCountdown(endsAt);

  if (totalSec <= 0) {
    return (
      <View style={styles.expired}>
        <Text variant="caption" style={{ color: colors.status.danger }}>
          Finalizado
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <Text variant="caption" tone="gold">
        {days > 0 ? `${days}d ` : ''}
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </Text>
    );
  }

  const Cell = ({ value, label }: { value: number; label: string }) => (
    <View style={styles.cell}>
      <Text variant="h2" tone="gold">
        {String(value).padStart(2, '0')}
      </Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );

  return (
    <View style={styles.row} key={tick}>
      <Cell value={days} label="DÍAS" />
      <Text variant="h2" tone="muted">·</Text>
      <Cell value={hours} label="HRS" />
      <Text variant="h2" tone="muted">·</Text>
      <Cell value={minutes} label="MIN" />
      <Text variant="h2" tone="muted">·</Text>
      <Cell value={seconds} label="SEG" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cell: {
    alignItems: 'center',
    minWidth: 44,
    paddingVertical: spacing.xs,
  },
  expired: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(229,72,77,0.15)',
    alignSelf: 'flex-start',
  },
});
