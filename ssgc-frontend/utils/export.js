import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

export async function exportToCSV(columns, records, fileName = 'billing_records.csv') {
  const header = columns.join(',');
  const rows = records.map((row) =>
    columns.map((col) => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      const str = String(value).replace(/"/g, '""');
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  );
  const csvContent = [header, ...rows].join('\n');

  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.write(csvContent);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export CSV' });
  }
}

export async function exportToExcel(columns, records, fileName = 'billing_records.xlsx') {
  const data = records.map((row) => {
    const obj = {};
    columns.forEach((col) => { obj[col.toUpperCase()] = row[col]; });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Billing Records');

  // 'array' gives raw bytes directly — no need to go through base64
  // encoding/decoding at all with the new File API
  const wbArray = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const bytes = new Uint8Array(wbArray);

  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.write(bytes);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export Excel',
    });
  }
}