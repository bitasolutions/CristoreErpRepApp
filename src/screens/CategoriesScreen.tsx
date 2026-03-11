import React, {useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text as RNText, View} from 'react-native';
import {Icon, ListItem, Text} from '@/components/ui';
import {useThemeColors} from '@/hooks/useTheme';
import {ScreenContainer} from '@/components/ScreenContainer';
import {useCategories, useSubCategories} from '@/hooks/api';

export const CategoriesScreen = () => {
  const {data: categories = [], isLoading} = useCategories();
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | undefined>();
  const {data: subCategories = []} = useSubCategories(expandedCategoryId);
  const c = useThemeColors();

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator size={40} color={c.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={categories}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => {
          const expanded = expandedCategoryId === item.id;
          return (
            <View>
              <ListItem
                title={item.category ?? 'Unnamed category'}
                onPress={() => setExpandedCategoryId(expanded ? undefined : item.id)}
                right={<Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={c.textMuted} />}
              />
              {expanded
                ? subCategories.map(sub => (
                    <View key={sub.subcategoryId} style={[styles.subRow, {borderLeftColor: c.subChipBorder}]}>
                      <RNText style={[styles.subText, {color: c.subChip}]}>
                        {sub.subcategory ?? 'Unnamed'}
                      </RNText>
                    </View>
                  ))
                : null}
            </View>
          );
        }}
        ListEmptyComponent={<Text muted>No categories available.</Text>}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  subRow: {paddingVertical: 8, paddingLeft: 20, borderLeftWidth: 3, marginLeft: 16, marginBottom: 2},
  subText: {fontSize: 13, fontWeight: '500'},
});
