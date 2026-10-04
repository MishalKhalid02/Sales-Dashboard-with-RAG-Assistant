const express= require('express');
const router= express.Router();
const pool= require('../config/db');

// Health check route
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT 1');   
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ status: 'error', message: 'disconnected' });
    }   

});

module.exports= router;