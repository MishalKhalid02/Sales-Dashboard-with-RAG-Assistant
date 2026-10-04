const pool=require('../config/db');
const { getKpisData, getRegionBreakdownData, getTrendData } = require('../services/billingService');

async function getKpis(req, res) {
  try {
    const data = await getKpisData(req.query);
    res.json(data);
  } catch (err) {
    console.error('getKpis error:', err);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
}

async function getRegionBreakdown(req, res) {
  try {
    const data = await getRegionBreakdownData(req.query);
    res.json(data);
  } catch (err) {
    console.error('getRegionBreakdown error:', err);
    res.status(500).json({ error: 'Failed to fetch region breakdown' });
  }
}

async function getTrend(req, res) {
  try {
    const months = parseInt(req.query.months, 10) || 12;
    const data = await getTrendData(req.query, months);
    res.json(data);
  } catch (err) {
    console.error('getTrend error:', err);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
}




async function getBillingRecords(req, res) {
  try {
    const {
      month, unit, region, zone, subzone, area,
      mainClass, customerClass,
      page = 1, pageSize = 50
    } = req.query;

    const conditions = [];
    const params = [];

    if (month) {
      conditions.push('b.billing_month = ?');
      params.push(month);
    }

    if (area) {
      conditions.push('b.area = ?');
      params.push(area);
    } else if (subzone) {
      conditions.push('g.subzone_cd = ?');
      params.push(subzone);
    } else if (zone) {
      conditions.push('g.zone_cd = ?');
      params.push(zone);
    } else if (region) {
      conditions.push('g.region_cd = ?');
      params.push(region);
    } else if (unit) {
      conditions.push('g.unit_cd = ?');
      params.push(unit);
    }

    if (customerClass) {
      conditions.push('b.cust_cl_cd = ?');
      params.push(customerClass);
    } else if (mainClass) {
      conditions.push('c.mainclass = ?');
      params.push(mainClass);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM ngrlng_sale_202608 b
       JOIN location g ON g.area_cd = b.area
       JOIN customer_class c ON c.customerclass_cd = b.cust_cl_cd
       ${whereClause}`,
      params
    );
    const totalRecords = countRows[0].total;

    // Totals across the WHOLE filtered set, not just the current page —
    // same WHERE clause, no LIMIT/OFFSET, only the summable numeric columns.
    const [totalsRows] = await pool.query(
      `SELECT
         SUM(b.gas_charges) AS gas_charges, SUM(b.meter_rent) AS meter_rent,
         SUM(b.gst) AS gst, SUM(b.total_scm) AS total_scm,
         SUM(b.total_mmbtu) AS total_mmbtu, SUM(b.less_prov_bills) AS less_prov_bills,
         SUM(b.arrears) AS arrears, SUM(b.total_cur_bill) AS total_cur_bill,
         SUM(b.total_net_bill) AS total_net_bill, SUM(b.lps_charged) AS lps_charged,
         SUM(b.lps) AS lps, SUM(b.debit_dr) AS debit_dr, SUM(b.credit_cr) AS credit_cr,
         SUM(b.last_payment) AS last_payment, SUM(b.gds) AS gds,
         SUM(b.prov_cons) AS prov_cons, SUM(b.tot_bills) AS tot_bills,
         SUM(b.tot_cons_final) AS tot_cons_final, SUM(b.tot_cons) AS tot_cons,
         SUM(b.op_bal) AS op_bal, SUM(b.cl_bal) AS cl_bal, SUM(b.wht_tax) AS wht_tax,
         SUM(b.gidcess) AS gidcess, SUM(b.gst_extra) AS gst_extra,
         SUM(b.gst_further) AS gst_further, SUM(b.gst_val_add) AS gst_val_add,
         SUM(b.gst_standard) AS gst_standard, SUM(b.gst_adj) AS gst_adj,
         SUM(b.gaschg_adj) AS gaschg_adj, SUM(b.psms) AS psms, SUM(b.rcons) AS rcons,
         SUM(b.ngrlng) AS ngrlng, SUM(b.woglamtcm) AS woglamtcm,
         SUM(b.woglamtmmbtu) AS woglamtmmbtu, SUM(b.np_fixed_charges) AS np_fixed_charges,
         SUM(b.p_fixed_charges) AS p_fixed_charges, SUM(b.levy_charges) AS levy_charges,
         SUM(b.levy_adj) AS levy_adj, SUM(b.np_fix_adj) AS np_fix_adj,
         SUM(b.p_fix_adj) AS p_fix_adj
       FROM ngrlng_sale_202608 b
       JOIN location g ON g.area_cd = b.area
       JOIN customer_class c ON c.customerclass_cd = b.cust_cl_cd
       ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT
         b.billing_month, b.cust_cl_cd, b.area, b.gas_charges, b.meter_rent, b.gst,
         b.total_scm, b.total_mmbtu, b.less_prov_bills, b.arrears, b.total_cur_bill,
         b.total_net_bill, b.lps_charged, b.lps, b.debit_dr, b.credit_cr, b.last_payment,
         b.gds, b.prov_cons, b.tot_bills, b.sms_code, b.first_bill, b.tot_cons_final,
         b.tot_cons, b.op_bal, b.cl_bal, b.wht_tax, b.status, b.sic_cd, b.gidcess,
         b.gst_extra, b.gst_further, b.gst_val_add, b.gst_standard, b.gst_adj,
         b.gaschg_adj, b.psms, b.rcons, b.ngrlng, b.woglamtcm, b.woglamtmmbtu,
         b.np_fixed_charges, b.p_fixed_charges, b.levy_charges, b.levy_adj,
         b.category_group, b.np_fix_adj, b.p_fix_adj
       FROM ngrlng_sale_202608 b
       JOIN location g ON g.area_cd = b.area
       JOIN customer_class c ON c.customerclass_cd = b.cust_cl_cd
       ${whereClause}
       ORDER BY b.billing_month DESC, b.area
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      records: rows,
      totals: totalsRows[0],
      page: parseInt(page, 10),
      pageSize: limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit)
    });
  } catch (err) {
    console.error('getBillingRecords error:', err);
    res.status(500).json({ error: 'Failed to fetch billing records' });
  }
}

module.exports = { getKpis, getRegionBreakdown, getTrend, getBillingRecords };

