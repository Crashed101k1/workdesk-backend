const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'WorkDesk API - backend listo' });
});

module.exports = router;
