import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    fetchAreas,
    fetchCustomerClasses,
    fetchMainClasses,
    fetchMonths,
    fetchRegions,
    fetchSubzones,
    fetchUnits,
    fetchZones
} from '../api/filters';
import LogoutButton from '../components/LogoutButton';
import { colors } from '../constants/colors';

export default function SelectionPaneScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const wideLayout = width >= 700;
  const [months, setMonths] = useState([]);
  const [mainClasses, setMainClasses] = useState([]);
  const [customerClasses, setCustomerClasses] = useState([]);
  const [units, setUnits] = useState([]);
  const [regions, setRegions] = useState([]);
  const [zones, setZones] = useState([]);
  const [subzones, setSubzones] = useState([]);
  const [areas, setAreas] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedMainClass, setSelectedMainClass] = useState('');
  const [selectedCustomerClass, setSelectedCustomerClass] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedSubzone, setSelectedSubzone] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  useEffect(() => {
    loadMonths();
    loadMainClasses();
    loadUnits();
  }, []);

  useEffect(() => {
    if (!selectedMainClass) {
      setCustomerClasses([]);
      setSelectedCustomerClass('');
      return;
    }
    loadCustomerClasses(selectedMainClass);
  }, [selectedMainClass]);

  useEffect(() => {
    if (!selectedUnit) {
      setRegions([]);
      setSelectedRegion('');
      return;
    }
    loadRegions(selectedUnit);
  }, [selectedUnit]);

  useEffect(() => {
    if (!selectedRegion) {
      setZones([]);
      setSelectedZone('');
      return;
    }
    loadZones(selectedRegion);
  }, [selectedRegion]);

  useEffect(() => {
    if (!selectedZone) {
      setSubzones([]);
      setSelectedSubzone('');
      return;
    }
    loadSubzones(selectedZone);
  }, [selectedZone]);

  useEffect(() => {
    if (!selectedSubzone) {
      setAreas([]);
      setSelectedArea('');
      return;
    }
    loadAreas(selectedSubzone);
  }, [selectedSubzone]);

  const loadMonths = async () => {
    try {
      const data = await fetchMonths();
      setMonths(data.map((m) => ({ label: m, value: m })));
    } catch (error) {
      console.log('Failed to load months:', error);
    }
  };

  const loadMainClasses = async () => {
    try {
      const data = await fetchMainClasses();
      setMainClasses(data.map((item) => ({
        label: item.mainclass,
        value: item.mainclass,
      })));
    } catch (error) {
      console.log('Failed to load main classes:', error);
    }
  };

  const loadCustomerClasses = async (mainClass) => {
    try {
      const data = await fetchCustomerClasses(mainClass);
      setCustomerClasses(data.map((item) => ({
        label: item.customerclass_descr,
        value: item.customerclass_cd,
      })));
    } catch (error) {
      console.log('Failed to load customer classes:', error);
    }
  };

  const loadUnits = async () => {
    try {
      const data = await fetchUnits();
      setUnits(data.map((item) => ({
        label: item.unit_descr || item.unit_cd,
        value: item.unit_cd,
      })));
    } catch (error) {
      console.log('Failed to load units:', error);
    }
  };

  const loadRegions = async (unit) => {
    try {
      const data = await fetchRegions(unit);
      setRegions(data.map((item) => ({
        label: item.region_descr || item.region_cd,
        value: item.region_cd,
      })));
    } catch (error) {
      console.log('Failed to load regions:', error);
    }
  };

  const loadZones = async (region) => {
    try {
      const data = await fetchZones(region);
      setZones(data.map((item) => ({
        label: item.zone_descr || item.zone_cd,
        value: item.zone_cd,
      })));
    } catch (error) {
      console.log('Failed to load zones:', error);
    }
  };

  const loadSubzones = async (zone) => {
    try {
      const data = await fetchSubzones(zone);
      setSubzones(data.map((item) => ({
        label: item.subzone_descr || item.subzone_cd,
        value: item.subzone_cd,
      })));
    } catch (error) {
      console.log('Failed to load subzones:', error);
    }
  };

  const loadAreas = async (subzone) => {
    try {
      const data = await fetchAreas(subzone);
      setAreas(data.map((item) => ({
        label: item.area_descr || item.area_cd,
        value: item.area_cd,
      })));
    } catch (error) {
      console.log('Failed to load areas:', error);
    }
  };

  const renderPicker = (label, value, onChange, options, placeholder) => (
    <View style={[styles.inputGroup, wideLayout && styles.inputGroupWide]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.selectBox}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
          mode="dropdown"
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label={placeholder} value="" color={colors.muted} />
          {options.map((option) => (
            <Picker.Item
              key={String(option.value)}
              label={String(option.label)}
              value={option.value}
              color={colors.text}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  const handleLookup = () => {
    navigation.navigate('Dashboard', {
      month: selectedMonth || undefined,
      mainClass: selectedMainClass || undefined,
      customerClass: selectedCustomerClass || undefined,
      unit: selectedUnit || undefined,
      region: selectedRegion || undefined,
      zone: selectedZone || undefined,
      subzone: selectedSubzone || undefined,
      area: selectedArea || undefined,
    });
  };

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={[colors.navyDeep, colors.ocean]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle} numberOfLines={2}>
            SSGCL GAS SALES DASHBOARD/REPORTS
          </Text>
          <View style={styles.headerSide}>
            <LogoutButton navigation={navigation} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Selection Pane</Text>

          <View style={styles.filtersGrid}>
            {renderPicker('Billing Month', selectedMonth, setSelectedMonth, months, 'Select Billing Month')}
            {renderPicker('Main Customer Class', selectedMainClass, setSelectedMainClass, mainClasses, 'Select Main Customer Class')}
            {renderPicker('Customer Class', selectedCustomerClass, setSelectedCustomerClass, customerClasses, 'Select Customer Class')}
            {renderPicker('Unit', selectedUnit, setSelectedUnit, units, 'Select Unit')}
            {renderPicker('Region', selectedRegion, setSelectedRegion, regions, 'Select Region')}
            {renderPicker('Zone', selectedZone, setSelectedZone, zones, 'Select Zone')}
            {renderPicker('SubZone', selectedSubzone, setSelectedSubzone, subzones, 'Select SubZone')}
            {renderPicker('Area', selectedArea, setSelectedArea, areas, 'Select Area')}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={handleLookup}
            accessibilityRole="button"
          >
            <Text style={styles.submitButtonText}>View Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  header: {
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    color: colors.arctic,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: colors.arctic,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.navyDeep,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    marginTop: -18,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navyDeep,
    marginBottom: 20,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputGroupWide: {
    width: '48.5%',
  },
  label: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: '600',
  },
  selectBox: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    minHeight: 54,
    justifyContent: 'center',
  },
  picker: {
    color: colors.text,
    height: 54,
    width: '100%',
  backgroundColor: colors.surfaceMuted,
  },
  pickerItem: {
    color: colors.text,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: colors.navyDeep,
    borderRadius: 9,
    minHeight: 52,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: colors.arctic,
    fontWeight: '700',
    fontSize: 16,
  },
});