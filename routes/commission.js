const express = require('express');
const router = express.Router();

const {getCommissions, getCommission, addCommission, updateCommission, deleteCommission} = require('../controller/commissions');

router.get('/', getCommissions);
router.get('/:no', getCommission);
router.post('/',addCommission)
router.put('/update-commission/:no', updateCommission);
router.delete('/:no', deleteCommission);

module.exports = router;
