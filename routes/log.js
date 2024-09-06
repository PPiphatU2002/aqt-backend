const express = require('express');
const router = express.Router();

const { getLogs, getLogsByType, getLog, addLogs } = require('../controller/logs');

router.get('/', getLogs);
router.get('/:no', getLog);
router.get('/type/:no', getLogsByType);
router.post('/', addLogs);

module.exports = router;