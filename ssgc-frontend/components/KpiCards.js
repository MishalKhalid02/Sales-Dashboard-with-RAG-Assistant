import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

const items = [
  { key: 'total_consumers', label: 'Total Consumers', icon: 'people-outline', accent: 'ocean', tint: 'oceanSoft' },
  { key: 'total_revenue', label: 'Total Revenue', icon: 'cash-outline', accent: 'good', tint: 'goodSoft' },
  { key: 'gas_charges', label: 'Gas Charges', icon: 'flash-outline', accent: 'bad', tint: 'badSoft' },
  { key: 'total_records', label: 'Total Records', icon: 'document-text-outline', accent: 'navyMid', tint: 'surfaceMuted' },
  { key: 'total_scm', label: 'Total SCM', icon: 'speedometer-outline', accent: 'muted', tint: 'dusk' },
  { key: 'total_mmbtu', label: 'Total MMBTU', icon: 'trending-up-outline', accent: 'navyDeep', tint: 'oceanSoft' },
];

function formatValue(key, kpis) {
  const raw = Number(kpis[key] || 0);
  if (key === 'total_revenue' || key === 'gas_charges') return `Rs ${raw.toLocaleString()}`;
  return raw.toLocaleString();
}

export default function KpiCards({ kpis }) {
  if (!kpis) return null;

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.key} style={[styles.card, { borderLeftColor: colors[item.accent] }]}>
          <View style={styles.iconRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors[item.tint] }]}>
              <Ionicons name={item.icon} size={16} color={colors[item.accent]} />
            </View>
          </View>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {formatValue(item.key, kpis)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  card: {
    width: '48%', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
    borderColor: colors.border, borderLeftWidth: 3, paddingVertical: 14, paddingHorizontal: 12, marginBottom: 12,
  },
  iconRow: { marginBottom: 8 },
  iconCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '800', color: colors.navyDeep },
});