import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/format';

export const CartSummary = ({
  grandTotal,
  onSubmit,
  loading,
  disabled,
}: {
  grandTotal: number;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => {
  const c = useThemeColors();
  return (
    <View style={[styles.box, { borderColor: c.border }]}>
      <View style={styles.row}>
        <Text variant="title">Total</Text>
        <Text variant="title">{formatCurrency(grandTotal)}</Text>
      </View>
      <Button
        type="solid"
        style={styles.button}
        onPress={onSubmit}
        loading={loading}
        disabled={disabled}>
        Submit Order
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderTopWidth: 1,
    paddingTop: 4,
    paddingBottom: 5,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: { marginTop: 2, alignSelf: 'stretch' },
});
