const express = require('express');
const router = express.Router();

const {getTypes, getType, addType, updateType, deleteType} = require('../controller/types');

router.get('/', getTypes);
router.get('/:no', getType);
router.post('/',addType)
router.put('/update-type/:no', updateType);
router.delete('/:no', deleteType);

module.exports = router;
