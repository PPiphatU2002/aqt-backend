const express = require('express');
const router = express.Router();

const { getRank, getRanks, addRank, updateRank, deleteRank } = require('../controller/ranks');

router.get('/', getRank);
router.get('/:no', getRanks);
router.post('/', addRank);
router.put('/:no', updateRank);
router.delete('/:no', deleteRank);

module.exports = router;