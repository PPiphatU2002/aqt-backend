const express = require('express');
const router = express.Router();

const { getEmployees, getEmployee, updateEmployeePassword, updateEmployee, updateEmployeeAll, deleteEmployee } = require('../controller/employees');

router.get('/', getEmployees);
router.get('/:no', getEmployee);
router.put('/update-password/:no', updateEmployeePassword);
router.put('/update-employee/:no', updateEmployee);
router.put('/update-employee-all/:no', updateEmployeeAll);
router.delete('/:id', deleteEmployee);

module.exports = router;