const express = require('express');
const router = express.Router();
const { chat, transcribe } = require('../controllers/chatController');

router.post('/', chat);
router.post('/transcribe', transcribe);

module.exports = router;