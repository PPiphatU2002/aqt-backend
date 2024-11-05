const express = require('express');
const router = express.Router();

const {getDividends, getDividend, addDividend, updateDividend, deleteDividend} = require('../controller/dividends');

router.get('/', getDividends);
router.get('/:no', getDividend);
router.post('/', addDividend);
router.put('/update-dividend/:no', updateDividend);
router.delete('/:no', deleteDividend);

module.exports = router;