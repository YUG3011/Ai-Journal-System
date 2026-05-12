const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerFreeTrial = async (req, res) => {
  try {
    const { name, age } = req.body;

    // Validate input
    if (!name || !age) {
      return res.status(400).json({ error: 'Name and age are required' });
    }

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum <= 0 || ageNum > 120) {
      return res.status(400).json({ error: 'Age must be a number between 1 and 120' });
    }

    // Save to database
    const freeTrial = await prisma.freeTrial.create({
      data: {
        name: name.trim(),
        age: ageNum
      }
    });

    res.status(201).json({
      message: 'Free trial registered successfully',
      id: freeTrial.id,
      name: freeTrial.name,
      age: freeTrial.age
    });
  } catch (error) {
    console.error('Error registering free trial:', error);
    res.status(500).json({ error: 'Failed to register free trial' });
  }
};

module.exports = {
  registerFreeTrial
};
