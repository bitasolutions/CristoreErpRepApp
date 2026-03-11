import React from 'react';
import {FlatList, StyleSheet, Text as RNText, View} from 'react-native';
import {SearchBar} from '@/components/ui';
import {useThemeColors} from '@/hooks/useTheme';
import type {Product} from '@/types/api';
import {ProductCard} from '@/components/ProductCard';

interface ProductSearchProps {
  searchText: string;
  setSearchText: (text: string) => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductSearch = ({searchText, setSearchText, products, onSelectProduct}: ProductSearchProps) => {
  const c = useThemeColors();
  return (
    <View style={styles.wrapper}>
      <SearchBar
        placeholder="Search products by name"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={products}
        keyExtractor={item => String(item.productId)}
        renderItem={({item}) => <ProductCard product={item} onPress={onSelectProduct} />}
        ListEmptyComponent={
          <RNText style={[styles.empty, {color: c.textMuted}]}>No products found.</RNText>
        }
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={9}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {flex: 1},
  empty: {textAlign: 'center', paddingTop: 24, fontSize: 14},
});
