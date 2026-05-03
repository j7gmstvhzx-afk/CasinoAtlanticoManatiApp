import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, palette } from '@/theme';

type Props = ViewProps & {
  scroll?: boolean;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  withGradient?: boolean;
};

export function Screen({ children, edges = ['top'], withGradient = true, style, ...rest }: Props) {
  return (
    <View style={styles.root}>
      {withGradient ? (
        <LinearGradient
          colors={[palette.midnight, palette.obsidian, palette.midnight]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <SafeAreaView edges={edges} style={[styles.safe, style]} {...rest}>
        {children}
      </SafeAreaView>
    </View>
  );
}

export function ScreenPadding({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={{ paddingBottom: insets.bottom + 24 }}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  safe: { flex: 1 },
});
