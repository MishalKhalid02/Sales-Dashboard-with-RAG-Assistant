const pool = require('../config/db');

function buildFilterConditions({ month, unit, region, zone, subzone, area, mainClass, customerClass }) {
  const conditions = [];
  const params = [];

  if (month) { conditions.push('b.billing_month = ?'); params.push(month); }

  if (area) { conditions.push('b.area = ?'); params.push(area); }
  else if (subzone) { conditions.push('g.subzone_cd = ?'); params.push(subzone); }
  else if (zone) { conditions.push('g.zone_cd = ?'); params.push(zone); }
  else if (region) { conditions.push('g.region_cd = ?'); params.push(region); }
  else if (unit) { conditions.push('g.unit_cd = ?'); params.push(unit); }

  if (customerClass) { conditions.push('b.cust_cl_cd = ?'); params.push(customerClass); }
  else if (mainClass) { conditions.push('c.mainclass = ?'); params.push(mainClass); }

  return { whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

async function getKpisData(filters) {
  const { whereClause, params } = buildFilterConditions(filters);

  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total_records,
       SUM(b.tot_cons) AS total_consumers,
       SUM(b.last_payment) AS total_revenue,
       SUM(b.gas_charges) AS gas_charges,
       SUM(b.total_scm) AS total_scm,
       SUM(b.total_mmbtu) AS total_mmbtu
     FROM ngrlng_sale_202608 b
     JOIN location g ON g.area_cd = b.area
     JOIN customer_class c ON c.customerclass_cd = b.cust_cl_cd
     ${whereClause}`,
    params
  );

  return rows[0];
}

async function getRegionBreakdownData(filters) {
  const { whereClause, params } = buildFilterConditions(filters);

  const [rows] = await pool.query(
    `SELECT g.region_cd, g.region_descr, SUM(b.gas_charges) AS gas_charges
     FROM ngrlng_sale_202608 b
     JOIN location g ON g.area_cd = b.area
     JOIN customer_class c ON c.customerclass_cd = b.cust_cl_cd
     ${whereClause}
     GROUP BY g.region_cd, g.region_descr
     ORDER BY gas_charges DESC`,
    params
  );

  return rows;
}

async function getTrendData(filters, months = 12) {
  // month is deliberately excluded from filters here — a trend needs
  // multiple months, so even if one was passed in, we ignore it.
  const { month, ...rest } = filters;
  const { whereClause, params } = buildFilterConditions(rest);

  const [rows] = await pool.query(
    `SELECT b.billing_month,
            SUM(b.gas_charges) AS gas_charges,
            SUM(b.last_payment) AS payment
     FROM ngrlng_sale_202608 b
     JOIN location g ON g.area_cd = b.area
     JOIN customer_class c ON c.customerclass_cd = b.cust_cl_cd
     ${whereClause}
     GROUP BY b.billing_month
     ORDER BY b.billing_month DESC
     LIMIT ?`,
    [...params, months]
  );

  return rows.reverse();
}

// Whitelisted — the model can only ever pick from these exact column
// names, never inject an arbitrary one. This is what keeps a flexible
// "any metric" tool safe: column names can't be parameterized like
// values can, so validation against a fixed list is the real guardrail.
const ALLOWED_METRICS = new Set([
  'gas_charges', 'meter_rent', 'gst', 'total_scm', 'total_mmbtu', 'less_prov_bills',
  'arrears', 'total_cur_bill', 'total_net_bill', 'lps_charged', 'lps', 'debit_dr',
  'credit_cr', 'last_payment', 'gds', 'prov_cons', 'tot_bills', 'tot_cons_final',
  'tot_cons', 'op_bal', 'cl_bal', 'wht_tax', 'gidcess', 'gst_extra', 'gst_further',
  'gst_val_add', 'gst_standard', 'gst_adj', 'gaschg_adj', 'psms', 'rcons', 'ngrlng',
  'woglamtcm', 'woglamtmmbtu', 'np_fixed_charges', 'p_fixed_charges',
  'levy_charges', 'levy_adj', 'np_fix_adj', 'p_fix_adj',
]);

const ALLOWED_AGGREGATIONS = new Set(['SUM', 'AVG', 'COUNT', 'MIN', 'MAX']);

const GROUP_BY_COLUMNS = {
  billing_month: 'b.billing_month',
  region: 'g.region_descr',
  zone: 'g.zone_descr',
  subzone: 'g.subzone_descr',
  area: 'g.area_descr',
  unit: 'g.unit_descr',
  mainclass: 'c.mainclass',
  customerclass: 'c.customerclass_descr',
};

// General-purpose: any allowed column, any aggregation, optionally
// grouped, still filtered by the same safe geography/class conditions.
async function getBillingMetricData({ metric, aggregation = 'SUM', groupBy, ...filters }) {
  if (!ALLOWED_METRICS.has(metric)) {
    throw new Error(`Unknown metric "${metric}". Valid metrics: ${[...ALLOWED_METRICS].join(', ')}`);
  }

  const agg = String(aggregation).toUpperCase();
  if (!ALLOWED_AGGREGATIONS.has(agg)) {
    throw new Error(`Unknown aggregation "${aggregation}". Use SUM, AVG, COUNT, MIN, or MAX.`);
  }

  const { whereClause, params } = buildFilterConditions(filters);

  let selectCols = `${agg}(b.${metric}) AS value`;
  let groupClause = '';

  if (groupBy && GROUP_BY_COLUMNS[groupBy]) {
    const col = GROUP_BY_COLUMNS[groupBy];
    selectCols = `${col} AS group_label, ${selectCols}`;
    groupClause = `GROUP BY ${col} ORDER BY value DESC`;
  }

  const [rows] = await pool.query(
    `SELECT ${selectCols}
     FROM ngrlng_sale_202608 b
     JOIN location g ON g.area_cd = b.area
     JOIN customer_class c ON c.customerclass_cd = b.cust_cl_cd
     ${whereClause}
     ${groupClause}`,
    params
  );

  return groupBy ? rows : rows[0];
}

// Small reference tables — safe to return in full, they're tiny.
async function getCustomerClassesData() {
  const [rows] = await pool.query(
    `SELECT customerclass_cd, customerclass_descr, mainclass
     FROM customer_class
     ORDER BY mainclass, customerclass_descr`
  );
  return rows;
}

const GEOGRAPHY_LEVELS = {
  unit: ['unit_cd', 'unit_descr'],
  region: ['region_cd', 'region_descr'],
  zone: ['zone_cd', 'zone_descr'],
  subzone: ['subzone_cd', 'subzone_descr'],
  area: ['area_cd', 'area_descr'],
};

async function getGeographyData(level = 'region') {
  const [cdCol, descrCol] = GEOGRAPHY_LEVELS[level] || GEOGRAPHY_LEVELS.region;
  const [rows] = await pool.query(
    `SELECT DISTINCT ${cdCol}, ${descrCol} FROM location ORDER BY ${descrCol}`
  );
  return rows;
}

// A small, capped sample of actual raw rows — for "show me some
// examples" style questions. Deliberately limited to 10 rows and a
// handful of the most relevant columns, so it doesn't flood the
// model's context with all 47 fields per row.
async function getBillingSampleData(filters) {
  const { whereClause, params } = buildFilterConditions(filters);

  const [rows] = await pool.query(
    `SELECT b.billing_month, b.area, g.area_descr, b.cust_cl_cd, c.customerclass_descr,
            b.gas_charges, b.total_cur_bill, b.total_net_bill, b.arrears, b.last_payment
     FROM ngrlng_sale_202608 b
     JOIN location g ON g.area_cd = b.area
     JOIN customer_class c ON c.customerclass_cd = b.cust_cl_cd
     ${whereClause}
     LIMIT 10`,
    params
  );

  return rows;
}

module.exports = {
  getKpisData, getRegionBreakdownData, getTrendData,
  getBillingMetricData, getCustomerClassesData, getGeographyData, getBillingSampleData,
}; 
