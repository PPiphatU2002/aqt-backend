const express = require('express');
const router = express.Router();

const {getBases, getBase, addBase, updateBase, deleteBase} = require('../controller/bases');

router.get('/', getBases);
router.get('/:no', getBase);
router.post('/',addBase)
router.put('/update-base/:no', updateBase);
router.delete('/:no', deleteBase);

module.exports = router;
