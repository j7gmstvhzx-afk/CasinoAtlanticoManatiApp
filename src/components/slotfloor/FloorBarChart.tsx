import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

const TEAL = '#2a9d8f';

export type BarItem = { label: string; value: number };

type Props = {
  data:   BarItem[];
  color?: string;
  title?: string;
};

const BAR_H    = 22;
const GAP      = 10;
const LABEL_W  = 90;
const VALUE_W  = 48;
const PAD_H    = 8;

export function FloorBarChart({ data, color = TEAL, title }: Props) {
  const { width } = useWindowDimensions();
  const chartW = Math.min(width - spacing.lg * 2 - 32, 420);
  const barW   = chartW - LABEL_W - VALUE_W - 8;
  const maxVal = data.length ? Math.max(...data.map(d => d.value)) : 1;
  const svgH   = data.length * (BAR_H + GAP) + PAD_H * 2;

  if (!data.length) return null;

  return (
    <View>
      {title ? (
        <Text variant="caption" tone="muted" style={{ marginBottom: spacing.sm }}>
          {title.toUpperCase()}
        </Text>
      ) : null}
      <Svg width={chartW} height={svgH}>
        {data.map((item, i) => {
          const y = PAD_H + i * (BAR_H + GAP);
          const filled = maxVal > 0 ? (item.value / maxVal) * barW : 0;
          return (
            <React.Fragment key={item.label}>
              {/* Background bar */}
              <Rect
                x={LABEL_W}
                y={y}
                width={barW}
                height={BAR_H}
                rx={6}
                fill="rgba(255,255,255,0.06)"
              />
              {/* Filled bar */}
              <Rect
                x={LABEL_W}
                y={y}
                width={filled}
                height={BAR_H}
                rx={6}
                fill={color}
                fillOpacity={0.85}
              />
              {/* Label */}
              <SvgText
                x={LABEL_W - 6}
                y={y + BAR_H / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fill={colors.text.muted}
              >
                {item.label}
              </SvgText>
              {/* Value */}
              <SvgText
                x={LABEL_W + barW + 6}
                y={y + BAR_H / 2 + 4}
                fontSize={11}
                fontWeight="600"
                fill={colors.text.secondary}
              >
                {item.value}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({});
