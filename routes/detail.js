const express = require('express');
const router = express.Router();

const {getDetails, getDetail, addDetail, updateDetail, updateDetailbyTransaction, deleteDetail} = require('../controller/details');

router.get('/', getDetails);
router.get('/:no', getDetail);
router.post('/',addDetail)
router.put('/update-detail/:no', updateDetail);
router.put('/update-detail-bytransaction/:no', updateDetailbyTransaction);
router.delete('/:no', deleteDetail);

module.exports = router;
