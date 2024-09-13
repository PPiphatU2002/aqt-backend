const express = require('express');
const router = express.Router();

const { getEmployees, getEmployee, getEmployeeEmail, updateEmployeePassword, updateEmployee, updateEmployeeAll, deleteEmployee } = require('../controller/employees');

// ตั้งค่าเส้นทางของ API
router.get('/', getEmployees);
router.get('/:no', getEmployee);
router.get('/email/:email', getEmployeeEmail);
router.put('/update-password/:no', updateEmployeePassword);
router.put('/update-employee/:no', updateEmployee);
router.put('/update-employee-all/:no', updateEmployeeAll);
router.delete('/:no', deleteEmployee);

module.exports = router;
