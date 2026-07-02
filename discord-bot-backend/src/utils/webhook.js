import axios from 'axios';
import prisma from '../config/prisma.js';

export const sendNotification = async (message, retries = 3) => {
  let webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  
  // Try to get from DB if env var is missing or we prefer DB config
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'NOTIFICATION_WEBHOOK_URL' }
    });
    if (config && config.value) {
      webhookUrl = config.value;
    }
  } catch (err) {
    console.error('Error fetching webhook URL from DB:', err);
  }

  if (!webhookUrl) {
    console.warn('NOTIFICATION_WEBHOOK_URL is not set in ENV or DB. Skipping notification.');
    return;
  }

  for (let i = 0; i < retries; i++) {
    try {
      await axios.post(webhookUrl, { content: message });
      console.log('Notification sent successfully.');
      return; // Success, exit loop
    } catch (err) {
      console.error(`Failed to send notification (Attempt ${i + 1}/${retries})`, err.message);
      if (i < retries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
      }
    }
  }

  // If we reach here, all retries failed
  throw new Error('Failed to send notification after maximum retries');
};
