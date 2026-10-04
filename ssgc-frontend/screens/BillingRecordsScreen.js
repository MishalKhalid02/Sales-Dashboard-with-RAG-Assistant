import { StyleSheet, Text } from 'react-native';
import BillingRecordsTable from '../components/BillingRecordsTable';
import DashboardScreenLayout from '../components/DashboardScreenLayout';
import { colors } from '../constants/colors';

export default function BillingRecordsScreen({ route, navigation }) {
  const filters = route.params || {};

  return (
    <DashboardScreenLayout route={route} navigation={navigation}>
      <Text style={styles.sectionTitle}>Area Wise Billing Details</Text>
      <BillingRecordsTable filters={filters} />
    </DashboardScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.navyDeep, fontSize: 22, fontWeight: '700', marginBottom: 18 },
});
