import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

// Get all command configurations
router.get('/', async (req, res) => {
  try {
    const configs = await prisma.commandConfig.findMany();
    res.json(configs);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Update or create a command configuration
router.put('/:command', async (req, res) => {
  const { command } = req.params;
  const { isEnabled, replyText } = req.body;

  try {
    const updated = await prisma.commandConfig.upsert({
      where: { command },
      update: { isEnabled, replyText },
      create: { command, isEnabled, replyText }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Get system config
router.get('/system/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    
    // If it exists in DB, return it. Otherwise, return fallback from env if available.
    if (config) {
      res.json(config);
    } else {
      res.json({ key, value: process.env[key] || null });
    }
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Failed to fetch system configuration' });
  }
});

// Update system config
router.put('/system/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  try {
    const updated = await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({ error: 'Failed to update system configuration' });
  }
});

export default router;
