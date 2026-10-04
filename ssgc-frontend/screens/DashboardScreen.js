import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { fetchKpis } from '../api/dashboard';
import DashboardScreenLayout from '../components/DashboardScreenLayout';
import GasChargesPieChart from '../components/GasChargesPieChart';
import KpiCards from '../components/KpiCards';
import { colors } from '../constants/colors';

export default function DashboardScreen({ route, navigation }) {
  const filters = route.params || {};
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchKpis(filters)
      .then(setKpis)
      .catch((err) => {
        console.log('Failed to load KPIs:', err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <DashboardScreenLayout route={route} navigation={navigation}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.navyDeep} style={{ marginVertical: 20 }} />
        ) : (
          <KpiCards kpis={kpis} />
        )}

        <GasChargesPieChart filters={filters} />
    </DashboardScreenLayout>
  );
}

const styles = StyleSheet.create({
});