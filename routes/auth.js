const express = require('express');
const router = express.Router();

const { login, refresh, logout, register, checkEmailDuplicate } = require('../controller/auths.js');

router.post('/login', login);
router.get('/refresh', refresh);
router.delete('/logout', logout);
router.post('/register', register);
router.post('/check-email-duplicate', checkEmailDuplicate);

module.exports = router;