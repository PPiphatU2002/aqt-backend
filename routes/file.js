// routes/file.js
const express = require('express');
const router = express.Router();

const { getProfile, readProfile, readDefault, downloadProfile, uploadProfile, updateProfile, deleteProfile } = require('../controller/files');

router.get('/profile', getProfile);
router.get('/profile/:picture', readProfile);
router.get('/default/:picture', readDefault);
router.get('/profile/download/:picture', downloadProfile);
router.post('/profile', uploadProfile);
router.put('/profile/update/:no', updateProfile);
router.delete('/profile/:no', deleteProfile);

module.exports = router;
