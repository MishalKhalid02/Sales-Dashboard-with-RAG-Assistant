const pool = require('../config/db');

async function getUnits(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT unit_cd, unit_descr FROM location ORDER BY unit_descr`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
}

async function getRegions(req, res) {
  const { unit } = req.query;
  if (!unit) return res.status(400).json({ error: 'unit query param is required' });

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT region_cd, region_descr FROM location WHERE unit_cd = ? ORDER BY region_descr`,
      [unit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
}

async function getZones(req, res) {
  const { region } = req.query;
  if (!region) return res.status(400).json({ error: 'region query param is required' });

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT zone_cd, zone_descr FROM location WHERE region_cd = ? ORDER BY zone_descr`,
      [region]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
}

async function getSubzones(req, res) {
  const { zone } = req.query;
  if (!zone) return res.status(400).json({ error: 'zone query param is required' });

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT subzone_cd, subzone_descr FROM location WHERE zone_cd = ? ORDER BY subzone_descr`,
      [zone]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subzones' });
  }
}

async function getAreas(req, res) {
  const { subzone } = req.query;
  if (!subzone) return res.status(400).json({ error: 'subzone query param is required' });

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT area_cd, area_descr FROM location WHERE subzone_cd = ? ORDER BY area_descr`,
      [subzone]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch areas' });
  }
}

async function getMainClasses(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT mainclass FROM customer_class ORDER BY mainclass`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch main classes' });
  }
}

async function getCustomerClasses(req, res) {
  const { mainClass } = req.query;
  if (!mainClass) return res.status(400).json({ error: 'mainClass query param is required' });

  try {
    const [rows] = await pool.query(
      `SELECT customerclass_cd, customerclass_descr FROM customer_class WHERE mainclass = ? ORDER BY customerclass_descr`,
      [mainClass]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customer classes' });
  }
}

async function getMonths(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT billing_month FROM ngrlng_sale_202608 ORDER BY billing_month DESC`
    );
    res.json(rows.map(r => r.billing_month));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch billing months' });
  }
}

module.exports = {
  getUnits, getRegions, getZones, getSubzones, getAreas,
  getMainClasses, getCustomerClasses, getMonths 
};