import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Chip} from '@/components/ui';
import type {Category, SubCategory} from '@/types/api';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategoryId?: number;
  onSelectCategory: (id?: number) => void;
  subCategories: SubCategory[];
  selectedSubCategoryId?: number;
  onSelectSubCategory: (id?: number) => void;
  hideAll?: boolean;
}

export const CategoryChips = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  subCategories,
  selectedSubCategoryId,
  onSelectSubCategory,
  hideAll = false,
}: CategoryChipsProps) => (
  <View style={styles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {!hideAll && (
        <Chip
          selected={!selectedCategoryId}
          onPress={() => onSelectCategory(undefined)}
          variant="category">
          All
        </Chip>
      )}
      {categories.map(category => (
        <Chip
          key={category.id}
          selected={selectedCategoryId === category.id}
          onPress={() => onSelectCategory(category.id)}
          variant="category">
          {category.category ?? 'Unnamed'}
        </Chip>
      ))}
    </ScrollView>

    {selectedCategoryId && subCategories.length > 0 ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {subCategories.map(sub => (
          <Chip
            key={sub.subcategoryId}
            selected={selectedSubCategoryId === sub.subcategoryId}
            onPress={() => onSelectSubCategory(sub.subcategoryId)}
            variant="subcategory">
            {sub.subcategory ?? 'Unnamed'}
          </Chip>
        ))}
      </ScrollView>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {marginBottom: 10},
  row: {gap: 8, paddingVertical: 4, paddingRight: 12},
});
