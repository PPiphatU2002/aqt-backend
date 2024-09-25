const express = require('express');
const router = express.Router();

const {getFroms, getFrom, addFrom, updateFrom, deleteFrom} = require('../controller/froms');

router.get('/', getFroms);
router.get('/:no', getFrom);
router.post('/',addFrom)
router.put('/update-from/:no', updateFrom);
router.delete('/:no', deleteFrom);

module.exports = router;
