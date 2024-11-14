const express = require('express');
const router = express.Router();

const { getFollows, getFollow, addFollow, updateFollow, deleteFollow} = require('../controller/follows');

router.get('/', getFollows);
router.get('/:no', getFollow);
router.post('/', addFollow);
router.put('/update-follow/:no', updateFollow);
router.delete('/:no', deleteFollow);

module.exports = router;