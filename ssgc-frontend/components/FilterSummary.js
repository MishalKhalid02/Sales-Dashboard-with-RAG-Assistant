import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

const fieldLabels = {
  month: 'Billing Month', mainClass: 'Main Customer Class', customerClass: 'Customer Class',
  unit: 'Unit', region: 'Region', zone: 'Zone', subzone: 'SubZone', area: 'Area',
};

export default function FilterSummary({ filters }) {
  const entries = Object.entries(filters || {}).filter(([, value]) => value);
  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selected Filters</Text>
      <View style={styles.chipRow}>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.chip}>
            <Text style={styles.chipLabel}>{fieldLabels[key] || key}: </Text>
            <Text style={styles.chipValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: { fontSize: 13, fontWeight: '700', color: colors.navyDeep, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.ocean, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12,
  },
  chipLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  chipValue: { fontSize: 12, color: colors.text, fontWeight: '700' },
});