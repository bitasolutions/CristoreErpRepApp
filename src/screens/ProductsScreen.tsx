import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';
import {Badge, Button, Dialog, EmojiButton, Input, Text} from '@/components/ui';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ScreenContainer';
import {CategoryChips} from '@/components/CategoryChips';
import {ProductSearch} from '@/components/ProductSearch';
import {useDebouncedValue} from '@/hooks/useDebouncedValue';
import {useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '@/api/queryKeys';
import {useCategories, useProducts, useSubCategories} from '@/hooks/api';
import {useOrderStore} from '@/store/orderStore';
import type {RootStackParamList} from '@/navigation/AppNavigator';
import type {Product} from '@/types/api';

export const ProductsScreen = () => {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [subCategoryId, setSubCategoryId] = useState<number | undefined>();
  const [quantityProduct, setQuantityProduct] = useState<Product | null>(null);
  const [quantityText, setQuantityText] = useState('1');
  const debouncedSearch = useDebouncedValue(search);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {data: categories = []} = useCategories();
  const {data: subCategories = []} = useSubCategories(categoryId);
  const {data: products = [], isLoading} = useProducts(
    debouncedSearch || undefined,
    categoryId,
    subCategoryId,
  );

  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({queryKey: queryKeys.categories});
    qc.invalidateQueries({queryKey: queryKeys.products});
  };

  const addProductWithQty = useOrderStore(state => state.addProductWithQty);
  const cartCount = useOrderStore(state =>
    state.lines.reduce((sum, line) => sum + line.qty, 0),
  );

  useEffect(() => {
    if (categoryId && subCategories.length > 0 && !subCategoryId) {
      setSubCategoryId(subCategories[0]?.subcategoryId);
    }
  }, [categoryId, subCategories, subCategoryId]);

  const sortedProducts = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    const filtered = normalizedSearch
      ? products.filter(product =>
          (product.productName ?? '').toLowerCase().includes(normalizedSearch),
        )
      : products;
    return [...filtered].sort((a, b) =>
      (a.productName ?? '').localeCompare(b.productName ?? ''),
    );
  }, [products, debouncedSearch]);

  const openQuantityDialog = (product: Product) => {
    setQuantityProduct(product);
    setQuantityText('1');
  };

  const closeQuantityDialog = () => {
    setQuantityProduct(null);
    setQuantityText('1');
  };

  const confirmQuantity = () => {
    if (!quantityProduct) {
      return;
    }
    const qty = Number(quantityText);
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert('Invalid quantity', 'Enter a quantity greater than 0.');
      return;
    }
    addProductWithQty(quantityProduct, Math.floor(qty));
    closeQuantityDialog();
  };

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <Text variant="h3" style={styles.title}>Products</Text>
        <View style={styles.topActions}>
          <EmojiButton emoji="🔄" onPress={refresh} />
          <View style={styles.cartWrapper}>
            <EmojiButton
              emoji="🛒"
              size={24}
              onPress={() => navigation.navigate('OrderCreate')}
            />
            {cartCount > 0 ? (
              <Badge value={cartCount} style={styles.cartBadge} />
            ) : null}
          </View>
        </View>
      </View>

      <CategoryChips
        categories={categories}
        selectedCategoryId={categoryId}
        onSelectCategory={id => {
          setCategoryId(id);
          setSubCategoryId(undefined);
        }}
        subCategories={subCategories}
        selectedSubCategoryId={subCategoryId}
        onSelectSubCategory={setSubCategoryId}
      />

      {isLoading ? (
        <ActivityIndicator size={40} style={styles.loader} />
      ) : (
        <ProductSearch
          searchText={search}
          setSearchText={setSearch}
          products={sortedProducts}
          onSelectProduct={openQuantityDialog}
        />
      )}

      <Dialog
        visible={Boolean(quantityProduct)}
        onDismiss={closeQuantityDialog}
        title="Add to Cart"
        actions={
          <>
            <Button type="outline" compact onPress={closeQuantityDialog}>Cancel</Button>
            <Button type="solid" compact onPress={confirmQuantity}>Add</Button>
          </>
        }>
        <Text variant="title" style={styles.dialogProduct}>
          {quantityProduct?.productName ?? 'Product'}
        </Text>
        <Input
          label="Quantity"
          value={quantityText}
          onChangeText={setQuantityText}
          keyboardType="number-pad"
        />
      </Dialog>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {fontWeight: '700'},
  topActions: {flexDirection: 'row', alignItems: 'center', gap: 4},
  cartWrapper: {position: 'relative'},
  cartBadge: {position: 'absolute', top: -2, right: -2},
  loader: {marginTop: 24},
  dialogProduct: {marginBottom: 4},
});
