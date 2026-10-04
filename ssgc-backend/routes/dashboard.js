const express = require('express');
const router = express.Router();
const { getKpis,getRegionBreakdown,getTrend,getBillingRecords}= require('../controllers/dashboardController');

router.get('/kpis', getKpis);
router.get('/region',getRegionBreakdown);
router.get('/trend', getTrend);
router.get('/billing-records', getBillingRecords);
router.get('/regions', getRegionBreakdown);

module.exports = router;