import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

type Props = ViewProps & {
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
};

export function Screen({ children, edges = ['top'], style, ...rest }: Props) {
  return (
    <View style={styles.root}>
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
