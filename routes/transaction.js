const express = require('express');
const router = express.Router();

const {getTransactions, getTransaction, addTransaction, updateTransaction, deleteTransaction} = require('../controller/transactions');

router.get('/', getTransactions);
router.get('/:no', getTransaction);
router.post('/',addTransaction)
router.put('/update-transaction/:no', updateTransaction);
router.delete('/:no', deleteTransaction);

module.exports = router;
