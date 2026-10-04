import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
      .catch((err) =>
        console.log(
          'Failed to load revenue trend:',
          err.response?.data || err.message
        )
      )
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 20 }} />;
  }

  if (!trend || trend.length === 0) {
    return (
      <Text style={styles.emptyText}>
        No revenue data available.
      </Text>
    );
  }

  const chartWidth = Math.max(
    screenWidth - 32,
    trend.length * 70
  );

  // Find the highest revenue value
  const maxValue = Math.max(
    ...trend.map((t) => Number(t.payment) || 0)
  );

  // Create 5 Y-axis values
  const yAxisValues = [1, 0.75, 0.5, 0.25, 0].map(
    (percentage) => Math.round(maxValue * percentage)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Monthly Revenue Trend
      </Text>

      <Text style={styles.subtitle}>
        Revenue over 12 months
      </Text>

     

        {/* Line Chart */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
           <View style={styles.chartRow}>

    <View style={styles.yAxis}>
      {yAxisValues.map((value, index) => (
        <Text key={index} style={styles.yAxisLabel}>
          {value.toLocaleString('en-US')}
        </Text>
      ))}
    </View>
          <LineChart
            data={{
              labels: trend.map((t) =>
                formatMonthLabel(t.billing_month)
              ),

              datasets: [
                {
                  data: trend.map(
                    (t) => Number(t.payment) || 0
                  ),
                },
              ],
            }}
            width={chartWidth}
            height={200}
            withHorizontalLabels={false}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: () => colors.good,
              labelColor: () => colors.muted,
              propsForDots: {
                r: '3',
              },
            }}
            bezier
            style={{
              borderRadius: 8,
            }}
          />
          </View>
        </ScrollView>

      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navyDeep,
  },

  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
  },

  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    padding: 16,
  },

  chartRow: {
    flexDirection: 'row',
  },

  yAxis: {
    width: 75,
    height: 200,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  yAxisLabel: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'right',
    paddingRight: 5,
  },
});