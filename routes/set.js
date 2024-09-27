const express = require('express');
const router = express.Router();

const {getSets, getSet, addSet, updateSet, deleteSet} = require('../controller/sets');

router.get('/', getSets);
router.get('/:no', getSet);
router.post('/', addSet);
router.put('/update-set/:no', updateSet);
router.delete('/:no', deleteSet);

module.exports = router;