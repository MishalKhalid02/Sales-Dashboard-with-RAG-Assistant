import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { fetchRegionBreakdown } from '../api/dashboard';
import { colors } from '../constants/colors';

const screenWidth = Dimensions.get('window').width;

export default function GasChargesPieChart({ filters }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchRegionBreakdown(filters)
      .then((rows) => {
        setData(rows.map((row, index) => ({
          name: row.region_descr || row.region_cd,
          population: Number(row.gas_charges) || 0,
          color: colors.chartSeries[index % colors.chartSeries.length],
          legendFontColor: colors.text,
          legendFontSize: 11,
        })));
      })
      .catch((err) => console.log('Failed to load region breakdown:', err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 20 }} />;
  if (data.length === 0) return <Text style={styles.emptyText}>No region data available.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gas Charges by Region</Text>
      <PieChart
        data={data}
        width={screenWidth - 32}
        height={200}
        chartConfig={{ color: () => colors.text }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="8"
          style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700', color: colors.navyDeep, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: colors.muted, padding: 16 },
  chart: { borderRadius: 10 },
});