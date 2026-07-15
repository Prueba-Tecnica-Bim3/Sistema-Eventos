const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Registration service is running' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', endpoint: 'registrations' });
});

module.exports = router;
