import { StyleSheet, Text } from 'react-native';
import RevenueOverTimeChart from '../components/RevenueOverTimeChart';
import DashboardScreenLayout from '../components/DashboardScreenLayout';
import { colors } from '../constants/colors';

export default function RevenueTrendScreen({ route, navigation }) {
  const filters = route.params || {};

  return (
    <DashboardScreenLayout route={route} navigation={navigation}>
      <Text style={styles.sectionTitle}>Monthly Revenue Trend</Text>
      <RevenueOverTimeChart filters={filters} />
    </DashboardScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.navyDeep, fontSize: 22, fontWeight: '700', marginBottom: 18 },
});
