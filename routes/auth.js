const express = require('express');
const router = express.Router();

const { login, refresh, logout, register } = require('../controller/auths.js');

router.post('/login', login);
router.get('/refresh', refresh);
router.delete('/logout', logout);
router.post('/register', register);

module.exports = router;