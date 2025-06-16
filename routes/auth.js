const express = require('express');
const router = express.Router();
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post('/auth', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    return res.status(200).json({ isAdmin: true });
  } else {
    return res.status(403).json({ isAdmin: false });
  }
});

module.exports = router;