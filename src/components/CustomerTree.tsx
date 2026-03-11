import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, IconButton, ListItem} from '@/components/ui';
import {useThemeColors} from '@/hooks/useTheme';
import type {Customer} from '@/types/api';

interface CustomerTreeProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  selectedCustomerId?: string;
}

const CustomerNode = ({
  customer,
  level,
  onSelect,
  selectedCustomerId,
}: {
  customer: Customer;
  level: number;
  onSelect: (customer: Customer) => void;
  selectedCustomerId?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const c = useThemeColors();
  const hasBranches = Boolean(customer.branches?.length);
  const isSelected = selectedCustomerId === (customer.customerId ?? '');

  return (
    <View>
      <ListItem
        title={customer.customerName ?? 'Unnamed customer'}
        description={`Delivery: ${customer.deliveryDay ?? '-'} | Route: ${customer.routeId ?? '-'}`}
        onPress={() => onSelect(customer)}
        left={
          <IconButton
            name={hasBranches ? (expanded ? 'folder-open' : 'folder') : 'account'}
            onPress={hasBranches ? () => setExpanded(v => !v) : undefined}
            color={c.primary}
          />
        }
        right={
          hasBranches ? (
            <IconButton
              name={expanded ? 'chevron-up' : 'chevron-down'}
              onPress={() => setExpanded(v => !v)}
            />
          ) : null
        }
      />
      {isSelected ? (
        <View style={[styles.selectedBar, {backgroundColor: c.primary, marginLeft: 8 + level * 16}]} />
      ) : null}

      {expanded &&
        customer.branches?.map(branch => (
          <View key={`${branch.customerId ?? 'branch'}-${level + 1}`} style={{marginLeft: 16}}>
            <CustomerNode
              customer={branch}
              level={level + 1}
              onSelect={onSelect}
              selectedCustomerId={selectedCustomerId}
            />
          </View>
        ))}
    </View>
  );
};

export const CustomerTree = ({customers, onSelect, selectedCustomerId}: CustomerTreeProps) => (
  <View>
    {customers.map(customer => (
      <CustomerNode
        key={customer.customerId ?? `customer-${customer.customerName ?? 'unknown'}`}
        customer={customer}
        level={0}
        onSelect={onSelect}
        selectedCustomerId={selectedCustomerId}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  selectedBar: {height: 2, borderRadius: 1, marginBottom: 2},
});
