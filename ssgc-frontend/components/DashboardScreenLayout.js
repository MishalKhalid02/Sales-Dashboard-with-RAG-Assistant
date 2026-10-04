import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { confirmLogout } from '../utils/auth';

function formatMonth(month) {
  const value = String(month || '');
  if (!/^\d{6}$/.test(value)) return value;
  return new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1)
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function DashboardScreenLayout({ route, navigation, children }) {
  const filters = route.params || {};
  const selectedFilters = [
    filters.month && `Month: ${formatMonth(filters.month)}`,
    filters.mainClass && `Main class: ${filters.mainClass}`,
    filters.customerClass && `Customer class: ${filters.customerClass}`,
    filters.unit && `Unit: ${filters.unit}`,
    filters.region && `Region: ${filters.region}`,
    filters.zone && `Zone: ${filters.zone}`,
    filters.subzone && `Subzone: ${filters.subzone}`,
    filters.area && `Area: ${filters.area}`,
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.navyDeep, colors.ocean]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTitleRow}>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => (navigation.getParent() || navigation).navigate('SelectionPane')}
            accessibilityRole="button"
            accessibilityLabel="Back to filter selection"
            hitSlop={8}
          >
            <Ionicons name="chevron-back-outline" size={22} color={colors.dusk} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SSGC Dashboard</Text>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => confirmLogout(navigation.getParent() || navigation)}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            hitSlop={8}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.dusk} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.statusDot} />
          <Text style={styles.headerSubtitle}>
            {selectedFilters.length ? selectedFilters.join('  ·  ') : 'All billing data'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {children}
      </ScrollView>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate('Chat')}
        accessibilityRole="button"
        accessibilityLabel="Open AI assistant"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={25} color={colors.navyDeep} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mist },
  header: {
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 26,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerAction: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, gap: 8 },
  headerTitle: { color: colors.arctic, fontSize: 22, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerSubtitle: { color: colors.dusk, fontSize: 13, lineHeight: 18, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.good, marginTop: 5 },
  content: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 120, flexGrow: 1 },
  chatButton: {
    position: 'absolute', right: 22, bottom: 60, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.ocean, alignItems: 'center', justifyContent: 'center', elevation: 4,
    shadowColor: colors.navyDeep, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
});
