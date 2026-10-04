import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchBillingRecords } from '../api/dashboard';
import { exportToCSV, exportToExcel } from '../utils/export';
import { colors } from '../constants/colors';

const columns = [
  'billing_month', 'cust_cl_cd', 'area', 'gas_charges', 'meter_rent', 'gst',
  'total_scm', 'total_mmbtu', 'less_prov_bills', 'arrears', 'total_cur_bill',
  'total_net_bill', 'lps_charged', 'lps', 'debit_dr', 'credit_cr', 'last_payment',
  'gds', 'prov_cons', 'tot_bills', 'sms_code', 'first_bill', 'tot_cons_final',
  'tot_cons', 'op_bal', 'cl_bal', 'wht_tax', 'status', 'sic_cd', 'gidcess',
  'gst_extra', 'gst_further', 'gst_val_add', 'gst_standard', 'gst_adj',
  'gaschg_adj', 'psms', 'rcons', 'ngrlng', 'woglamtcm', 'woglamtmmbtu',
  'np_fixed_charges', 'p_fixed_charges', 'levy_charges', 'levy_adj',
  'category_group', 'np_fix_adj', 'p_fix_adj'
];

const COLUMN_WIDTH = 130;

export default function BillingRecordsTable({ filters }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const full = await fetchBillingRecords(filters, 1, 100000);
      if (format === 'csv') {
        await exportToCSV(columns, full.records);
      } else {
        await exportToExcel(columns, full.records);
      }
    } catch (error) {
      console.log('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBillingRecords(filters, page, 50)
      .then(setData)
      .catch((err) => console.log('Failed to load records:', err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [filters, page]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginVertical: 24 }} />;
  }

  if (!data || data.records.length === 0) {
    return <Text style={styles.emptyText}>No records match the selected filters.</Text>;
  }

  return (
    <View style={styles.container}>
        <View style={styles.exportRow}>
  <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('csv')} disabled={exporting === 'csv'}>
    <Text style={styles.exportButtonText}>{exporting === 'csv' ? 'Exporting...' : 'Export CSV'}</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('excel')} disabled={exporting === 'excel'}>
    <Text style={styles.exportButtonText}>{exporting === 'excel' ? 'Exporting...' : 'Export Excel'}</Text>
  </TouchableOpacity>
</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header row */}
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <Text key={col} style={[styles.headerCell, { width: COLUMN_WIDTH }]}>
                {col.toUpperCase()}
              </Text>
            ))}
          </View>

          {/* Data rows — vertical scroll nested inside the horizontal one */}
          <ScrollView style={styles.dataScroll}>
            {data.records.map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.dataRow, rowIndex % 2 === 1 && styles.dataRowAlt]}>
                {columns.map((col) => (
                  <Text key={col} style={[styles.dataCell, { width: COLUMN_WIDTH }]} numberOfLines={1}>
{row[col] !== null && row[col] !== undefined
  ? col === 'area'
    ? String(row[col]).padStart(4, '0')
    : String(row[col])
  : '-'}                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
          {data.totals && (
  <View style={styles.totalsRow}>
    {columns.map((col) => (
      <Text key={col} style={[styles.totalsCell, { width: COLUMN_WIDTH }]} numberOfLines={1}>
        {col === 'billing_month'
          ? 'TOTAL'
          : data.totals[col] !== null && data.totals[col] !== undefined
            ? Number(data.totals[col]).toLocaleString()
            : ''}
      </Text>
    ))}
  </View>
)}
        </View>
      </ScrollView>

      {/* Pagination controls */}
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={page <= 1}
          onPress={() => setPage((p) => p - 1)}
          style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>Prev</Text>
        </TouchableOpacity>

        <Text style={styles.pageLabel}>Page {data.page} / {data.totalPages}</Text>

        <TouchableOpacity
          disabled={page >= data.totalPages}
          onPress={() => setPage((p) => p + 1)}
          style={[styles.pageButton, page >= data.totalPages && styles.pageButtonDisabled]}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  headerRow: { flexDirection: 'row', backgroundColor: colors.navyDeep },
  headerCell: { padding: 10, fontSize: 11, fontWeight: '700', color: colors.dusk },
  dataScroll: { maxHeight: 400 },
  dataRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  dataRowAlt: { backgroundColor: colors.surfaceMuted },
  dataCell: { padding: 10, fontSize: 12, color: colors.text },
  emptyText: { textAlign: 'center', padding: 24, color: colors.muted },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: colors.border },
  pageButton: { backgroundColor: colors.navyDeep, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  pageButtonDisabled: { backgroundColor: colors.dusk },
  pageButtonText: { color: colors.arctic, fontWeight: '600' },
  pageLabel: { color: colors.text, fontWeight: '600' },
  totalsRow: {
  flexDirection: 'row',
  backgroundColor: colors.navyMid,
  borderTopWidth: 2,
  borderTopColor: colors.ocean,
},
totalsCell: {
  padding: 10,
  fontSize: 12,
  fontWeight: '700',
  color: colors.arctic,
},
exportRow: { flexDirection: 'row', gap: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
exportButton: { backgroundColor: colors.navyDeep, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
exportButtonText: { color: colors.arctic, fontWeight: '600', fontSize: 12 },
});