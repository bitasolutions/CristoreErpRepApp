/**
 * Custom UI component library – replaces React Native Paper (Material 3).
 * Design: clean, minimal, brand teal (#006A64).
 */
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useThemeColors} from '@/hooks/useTheme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// ─── Icon ────────────────────────────────────────────────────────────────────
export const Icon = ({
  name,
  size = 22,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}) => {
  const c = useThemeColors();
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color ?? c.text}
      style={style as any}
    />
  );
};

// ─── IconButton ──────────────────────────────────────────────────────────────
export const IconButton = ({
  name,
  size = 20,
  color,
  onPress,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
}) => {
  const c = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[ibStyles.btn, style]}>
      <MaterialCommunityIcons name={name} size={size} color={color ?? c.text} />
    </TouchableOpacity>
  );
};
const ibStyles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
});

// ─── EmojiButton ─────────────────────────────────────────────────────────────
export const EmojiButton = ({
  emoji,
  size = 20,
  onPress,
  style,
}: {
  emoji: string;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[ibStyles.btn, style]}>
      <RNText style={{fontSize: size}}>{emoji}</RNText>
    </TouchableOpacity>
  );
};

// ─── Text ─────────────────────────────────────────────────────────────────────
type TVariant = 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'caption' | 'label';
const TV: Record<TVariant, {fontSize: number; fontWeight: TextStyle['fontWeight']; lineHeight: number}> = {
  h1: {fontSize: 26, fontWeight: '700', lineHeight: 32},
  h2: {fontSize: 20, fontWeight: '700', lineHeight: 26},
  h3: {fontSize: 17, fontWeight: '600', lineHeight: 23},
  title: {fontSize: 15, fontWeight: '600', lineHeight: 21},
  body: {fontSize: 14, fontWeight: '400', lineHeight: 20},
  caption: {fontSize: 12, fontWeight: '400', lineHeight: 17},
  label: {fontSize: 11, fontWeight: '600', lineHeight: 16, letterSpacing: 0.6},
};

export const Text = ({
  children,
  variant = 'body',
  muted,
  style,
  numberOfLines,
}: {
  children?: React.ReactNode;
  variant?: TVariant;
  muted?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
}) => {
  const c = useThemeColors();
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[{color: muted ? c.textMuted : c.text, ...TV[variant]}, style]}>
      {children}
    </RNText>
  );
};

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  onPress,
  type = 'solid',
  disabled,
  loading,
  compact,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  type?: 'solid' | 'outline' | 'clear';
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}) => {
  const c = useThemeColors();
  const isDisabled = disabled || loading;
  const bg = type === 'solid' ? (isDisabled ? c.border : c.primary) : 'transparent';
  const borderColor = type === 'outline' ? (isDisabled ? c.border : c.primary) : 'transparent';
  const textColor = type === 'solid' ? '#FFFFFF' : isDisabled ? c.textMuted : c.primary;
  const h = compact ? 34 : 44;
  const px = compact ? 14 : 20;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        btnStyles.base,
        {backgroundColor: bg, borderColor, height: h, paddingHorizontal: px, borderWidth: type === 'outline' ? 1.5 : 0},
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <RNText style={[btnStyles.text, {color: textColor, fontSize: compact ? 13 : 14}]}>
          {children}
        </RNText>
      )}
    </TouchableOpacity>
  );
};
const btnStyles = StyleSheet.create({
  base: {borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'},
  text: {fontWeight: '600'},
});

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}) => {
  const c = useThemeColors();
  const inner = (
    <View style={[cardStyles.card, {backgroundColor: c.surface, borderColor: c.border}, style]}>
      {children}
    </View>
  );
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}>{inner}</TouchableOpacity>
  ) : inner;
};
const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    elevation: 2,
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    marginVertical: 4,
  },
});

// ─── Chip ─────────────────────────────────────────────────────────────────────
export const Chip = ({
  children,
  selected,
  onPress,
  variant = 'category',
}: {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'category' | 'subcategory';
}) => {
  const c = useThemeColors();
  const isSub = variant === 'subcategory';
  const bg = selected
    ? isSub ? c.subChipBorder : c.primary
    : isSub ? c.subChipBg : c.surfaceVariant;
  const textColor = selected ? '#FFFFFF' : isSub ? c.subChip : c.text;
  const borderColor = selected ? 'transparent' : isSub ? c.subChipBorder : c.border;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[chipStyles.chip, {backgroundColor: bg, borderColor}]}>
      <RNText style={[chipStyles.text, {color: textColor}]}>{children}</RNText>
    </TouchableOpacity>
  );
};
const chipStyles = StyleSheet.create({
  chip: {height: 40, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center'},
  text: {fontSize: 13, fontWeight: '600'},
});

// ─── SearchBar ────────────────────────────────────────────────────────────────
export const SearchBar = ({
  value,
  onChangeText,
  placeholder,
  style,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}) => {
  const c = useThemeColors();
  return (
    <View style={[sbStyles.container, {backgroundColor: c.surface, borderColor: c.border}, style]}>
      <MaterialCommunityIcons name="magnify" size={20} color={c.textMuted} style={sbStyles.icon} />
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        style={[sbStyles.input, {color: c.text}]}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChangeText('')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="close-circle" size={18} color={c.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
const sbStyles = StyleSheet.create({
  container: {flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 46, marginBottom: 8},
  icon: {marginRight: 8},
  input: {flex: 1, fontSize: 14, height: '100%'},
});

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = ({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  secureTextEntry,
  style,
}: {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
}) => {
  const c = useThemeColors();
  return (
    <View style={[inpStyles.wrapper, style]}>
      {label ? <RNText style={[inpStyles.label, {color: c.textMuted}]}>{label}</RNText> : null}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={c.textMuted}
        style={[inpStyles.input, {color: c.text, borderColor: c.border, backgroundColor: c.surface}]}
      />
    </View>
  );
};
const inpStyles = StyleSheet.create({
  wrapper: {gap: 4},
  label: {fontSize: 12, fontWeight: '500'},
  input: {height: 48, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, fontSize: 15, marginTop: 4},
});

// ─── Dialog ───────────────────────────────────────────────────────────────────
export const Dialog = ({
  visible,
  onDismiss,
  title,
  children,
  actions,
}: {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) => {
  const c = useThemeColors();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={dlgStyles.backdrop} onPress={onDismiss}>
        <Pressable style={[dlgStyles.box, {backgroundColor: c.surface}]} onPress={() => {}}>
          {title ? <RNText style={[dlgStyles.title, {color: c.text}]}>{title}</RNText> : null}
          <View style={dlgStyles.content}>{children}</View>
          {actions ? <View style={dlgStyles.actions}>{actions}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
const dlgStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', justifyContent: 'center', alignItems: 'center', padding: 28},
  box: {width: '100%', borderRadius: 18, padding: 24, elevation: 10, shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: {width: 0, height: 5}},
  title: {fontSize: 18, fontWeight: '700', marginBottom: 14},
  content: {marginBottom: 20},
  actions: {flexDirection: 'row', justifyContent: 'flex-end', gap: 10},
});

// ─── FAB ──────────────────────────────────────────────────────────────────────
export const FAB = ({
  icon,
  emoji,
  label,
  onPress,
  style,
}: {
  icon?: IconName;
  emoji?: string;
  label?: string;
  onPress: () => void;
  style?: ViewStyle;
}) => {
  const c = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[fabStyles.base, {backgroundColor: c.primary}, style]}>
      {emoji ? (
        <RNText style={fabStyles.emoji}>{emoji}</RNText>
      ) : icon ? (
        <MaterialCommunityIcons name={icon} size={22} color="#FFFFFF" />
      ) : null}
      {label ? <RNText style={fabStyles.label}>{label}</RNText> : null}
    </TouchableOpacity>
  );
};
const fabStyles = StyleSheet.create({
  base: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 30, elevation: 5, shadowOpacity: 0.22, shadowRadius: 7, shadowOffset: {width: 0, height: 3}},
  label: {color: '#FFFFFF', fontWeight: '700', fontSize: 14},
  emoji: {fontSize: 20},
});

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({value, style}: {value: number; style?: ViewStyle}) => {
  const c = useThemeColors();
  if (!value) return null;
  return (
    <View style={[bdgStyles.badge, {backgroundColor: c.error}, style]}>
      <RNText style={bdgStyles.text}>{value > 99 ? '99+' : value}</RNText>
    </View>
  );
};
const bdgStyles = StyleSheet.create({
  badge: {minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4},
  text: {color: '#FFFFFF', fontSize: 10, fontWeight: '700'},
});

// ─── ListItem ─────────────────────────────────────────────────────────────────
export const ListItem = ({
  title,
  description,
  left,
  right,
  onPress,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
}) => {
  const c = useThemeColors();
  const content = (
    <View style={[liStyles.row, {borderBottomColor: c.border}]}>
      {left ? <View style={liStyles.left}>{left}</View> : null}
      <View style={liStyles.content}>
        {typeof title === 'string' ? (
          <RNText style={[liStyles.title, {color: c.text}]} numberOfLines={1}>{title}</RNText>
        ) : title}
        {typeof description === 'string' ? (
          <RNText style={[liStyles.desc, {color: c.textMuted}]} numberOfLines={2}>{description}</RNText>
        ) : description}
      </View>
      {right ? <View style={liStyles.right}>{right}</View> : null}
    </View>
  );
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>
  ) : content;
};
const liStyles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth},
  left: {marginRight: 10},
  content: {flex: 1},
  right: {marginLeft: 8},
  title: {fontSize: 14, fontWeight: '500'},
  desc: {fontSize: 12, marginTop: 2},
});

// ─── Segment ──────────────────────────────────────────────────────────────────
export const Segment = ({
  options,
  selectedIndex,
  onSelect,
  style,
}: {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  style?: ViewStyle;
}) => {
  const c = useThemeColors();
  return (
    <View style={[segStyles.container, {backgroundColor: c.surfaceVariant, borderColor: c.border}, style]}>
      {options.map((opt, i) => {
        const active = i === selectedIndex;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(i)}
            style={[segStyles.option, active && {backgroundColor: c.primary}]}>
            <RNText style={[segStyles.text, {color: active ? '#FFFFFF' : c.text}]}>{opt}</RNText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
const segStyles = StyleSheet.create({
  container: {flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 16},
  option: {flex: 1, paddingVertical: 11, alignItems: 'center'},
  text: {fontSize: 13, fontWeight: '600'},
});
