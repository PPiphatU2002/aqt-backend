const express = require('express');
const router = express.Router();

const {getCustomers, getCustomer, addCustomer, updateCustomer, deleteCustomer} = require('../controller/customers');

router.get('/', getCustomers);
router.get('/:no', getCustomer);
router.post('/',addCustomer)
router.put('/update-customer/:no', updateCustomer);
router.delete('/:no', deleteCustomer);

module.exports = router;
