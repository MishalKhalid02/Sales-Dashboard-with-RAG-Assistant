const express = require('express');
const router = express.Router();
const {
  getUnits, getRegions, getZones, getSubzones, getAreas,
  getMainClasses, getCustomerClasses,getMonths
} = require('../controllers/filtersController');

router.get('/units', getUnits);
router.get('/regions', getRegions);
router.get('/zones', getZones);
router.get('/subzones', getSubzones);
router.get('/areas', getAreas);
router.get('/main-classes', getMainClasses);
router.get('/customer-classes', getCustomerClasses);
router.get('/months', getMonths);

module.exports = router;