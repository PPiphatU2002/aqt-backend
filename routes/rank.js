const express = require('express');
const router = express.Router();

const { getRank, getRanks, addRank, updateRank, deleteRank } = require('../controller/ranks');

router.get('/', getRanks);
router.get('/:no', getRank);
router.post('/', addRank);
router.put('/:no', updateRank);
router.delete('/:no', deleteRank);

module.exports = router;