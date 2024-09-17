const express = require('express');
const router = express.Router();

const { getEmployees, getEmployee, getEmployeeEmail, getEmployeePhone, updateEmployeePassword, updateEmployee, updateEmployeeAll, deleteEmployee, getEmployeesByStatus } = require('../controller/employees');

router.get('/', getEmployees);
router.get('/:no', getEmployee);
router.get('/email/:email', getEmployeeEmail);
router.get('/phone/:phone', getEmployeePhone);
router.put('/update-password/:no', updateEmployeePassword);
router.put('/update-employee/:no', updateEmployee);
router.put('/update-employee-all/:no', updateEmployeeAll);
router.delete('/:no', deleteEmployee);
router.get('/status/:no', getEmployeesByStatus);

module.exports = router;
