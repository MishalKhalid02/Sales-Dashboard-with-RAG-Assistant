import { StyleSheet, Text } from 'react-native';
import DashboardScreenLayout from '../components/DashboardScreenLayout';
import RevenueTrendChart from '../components/RevenueTrendChart';
import { colors } from '../constants/colors';

export default function RevenueLineGraphScreen({ route, navigation }) {
  const filters = route.params || {};

  return (
    <DashboardScreenLayout route={route} navigation={navigation}>
      <Text style={styles.sectionTitle}>Gas Charges vs Payment</Text>
      <RevenueTrendChart filters={filters} />
    </DashboardScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.navyDeep, fontSize: 22, fontWeight: '700', marginBottom: 18 },
});
