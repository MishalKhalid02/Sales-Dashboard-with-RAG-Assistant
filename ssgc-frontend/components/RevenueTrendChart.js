import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchTrend } from '../api/dashboard';
import { colors } from '../constants/colors';

const screenWidth = Dimensions.get('window').width;

function formatMonthLabel(billingMonth) {
  const str = String(billingMonth);
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  return `${month}/${year.slice(2)}`;
}

export default function RevenueTrendChart({ filters }) {
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTrend(filters, 12)
      .then(setTrend)
      .catch((err) => console.log('Failed to load trend:', err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 20 }} />;
  if (!trend || trend.length === 0) return <Text style={styles.emptyText}>No trend data available.</Text>;
if (trend.length === 1) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gas Charges vs Payment</Text>
      <View style={styles.singlePointBox}>
        <View style={styles.singlePointRow}>
          <View>
            <Text style={[styles.singlePointValue, { color: colors.bad, fontSize: 18 }]}>
              Rs {Number(trend[0].gas_charges || 0).toLocaleString()}
            </Text>
            <Text style={styles.singlePointLabel}>Gas Charges</Text>
          </View>
          <View>
            <Text style={[styles.singlePointValue, { color: colors.ocean, fontSize: 18 }]}>
              Rs {Number(trend[0].payment || 0).toLocaleString()}
            </Text>
            <Text style={styles.singlePointLabel}>Payment</Text>
          </View>
        </View>
        <Text style={styles.singlePointHint}>
          Comparison chart will appear once more months of data are available.
        </Text>
      </View>
    </View>
  );
}
  const chartWidth = Math.max(screenWidth - 32, trend.length * 70);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gas Charges vs Payment (Last 12 Months)</Text>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.bad }]} />
          <Text style={styles.legendText}>Gas Charges</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.ocean }]} />
          <Text style={styles.legendText}>Payment</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels: trend.map((t) => formatMonthLabel(t.billing_month)),
            datasets: [
              { data: trend.map((t) => Number(t.gas_charges) || 0), color: () => colors.bad, strokeWidth: 2 },
              { data: trend.map((t) => Number(t.payment) || 0), color: () => colors.ocean, strokeWidth: 2 },
            ],
          }}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: () => colors.navyDeep,
            labelColor: () => colors.muted,
            propsForDots: { r: '3' },
          }}
          bezier
          style={{ borderRadius: 8 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 16 },
  title: { fontSize: 14, fontWeight: '700', color: colors.navyDeep, marginBottom: 8 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.text },
  emptyText: { textAlign: 'center', color: colors.muted, padding: 16 },
});