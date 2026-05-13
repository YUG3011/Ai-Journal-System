const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/support', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const ticket = await prisma.supportTicket.create({
      data: { name, email, subject, message }
    });

    res.status(201).json({ message: 'Support ticket submitted successfully', ticket });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
