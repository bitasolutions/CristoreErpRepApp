import React from 'react';
import {StyleSheet, Text as RNText, View} from 'react-native';
import {Card} from '@/components/ui';
import {useThemeColors} from '@/hooks/useTheme';
import type {Product} from '@/types/api';
import {formatCurrency} from '@/utils/format';

export const ProductCard = ({product, onPress}: {product: Product; onPress?: (product: Product) => void}) => {
  const c = useThemeColors();
  const qty = product.balQty ?? 0;
  const stockColor = qty <= 0 ? c.error : qty < 10 ? c.warning : c.success;

  return (
    <Card onPress={() => onPress?.(product)} style={styles.card}>
      <View style={styles.content}>
        <View style={styles.left}>
          <RNText style={[styles.name, {color: c.text}]} numberOfLines={1}>
            {product.productName ?? 'Unnamed product'}
          </RNText>
          {product.barcode ? (
            <RNText style={[styles.barcode, {color: c.textMuted}]}>#{product.barcode}</RNText>
          ) : null}
        </View>
        <View style={styles.right}>
          <RNText style={[styles.price, {color: c.primary}]}>{formatCurrency(product.sellingPrice)}</RNText>
          <RNText style={[styles.stock, {color: stockColor}]}>
            {qty <= 0 ? 'Out of stock' : `Stock: ${qty}`}
          </RNText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {marginVertical: 3},
  content: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  left: {flex: 1, paddingRight: 10},
  right: {alignItems: 'flex-end'},
  name: {fontSize: 14, fontWeight: '500'},
  barcode: {fontSize: 11, marginTop: 2},
  price: {fontSize: 15, fontWeight: '700'},
  stock: {fontSize: 12, marginTop: 2},
});
