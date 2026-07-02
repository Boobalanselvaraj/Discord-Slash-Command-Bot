import express from 'express';
import { verifyDiscordRequest } from '../middleware/verifyDiscord.js';
import prisma from '../config/prisma.js';
import { sendNotification } from '../utils/webhook.js';
import { handleReportCommand, handleStatusCommand, handleLeaveSubmit, handleRoastMeCommand } from '../controllers/interactionsController.js';

const router = express.Router();

router.post('/', verifyDiscordRequest(process.env.DISCORD_PUBLIC_KEY), async (req, res) => {
  const { type, id, data, member, user, channel_id } = req.body;

  // 1 = PING
  if (type === 1) {
    return res.json({ type: 1 });
  }

  // 2 = APPLICATION_COMMAND
  if (type === 2) {
    const commandName = data.name;
    const userId = member?.user?.id || user?.id;

    // If command is 'leave', respond immediately with a Modal
    if (commandName === 'leave') {
      return res.json({
        type: 9, // APPLICATION_MODAL
        data: {
          title: "Leave Request",
          custom_id: "leave_modal",
          components: [
            {
              type: 1,
              components: [{ type: 4, custom_id: "start_date", label: "Start Date (YYYY-MM-DD)", style: 1, required: true, max_length: 10, placeholder: "e.g. 2024-05-01" }]
            },
            {
              type: 1,
              components: [{ type: 4, custom_id: "end_date", label: "End Date (YYYY-MM-DD)", style: 1, required: true, max_length: 10, placeholder: "e.g. 2024-05-05" }]
            },
            {
              type: 1,
              components: [{ type: 4, custom_id: "reason", label: "Reason for Leave", style: 2, required: true, max_length: 500, placeholder: "Personal reasons" }]
            }
          ]
        }
      });
    }

    // Log the command immediately for other commands
    try {
      await prisma.commandLog.create({
        data: {
          interactionId: id,
          commandName,
          userId,
          channelId: channel_id,
          payload: req.body,
        }
      });
    } catch (err) {
      if (err.code === 'P2002') {
        // Unique constraint failed, meaning duplicate interaction (deduplication)
        console.log(`Duplicate interaction received: ${id}`);
        return res.status(200).send('Duplicate');
      }
      console.error('Failed to log command', err);
    }

    // Respond immediately with type 5 (DEFERRED) to satisfy the 3-second rule
    res.json({ type: 5 });

    // Process the command in the background
    if (commandName === 'report') {
      handleReportCommand(req).catch(console.error);
    } else if (commandName === 'status') {
      handleStatusCommand(req).catch(console.error);
    } else if (commandName === 'roastme') {
      handleRoastMeCommand(req).catch(console.error);
    } else {
      console.log(`Unknown command: ${commandName}`);
    }
  }

  // 5 = MODAL_SUBMIT
  if (type === 5) {
    const customId = data.custom_id;
    const userId = member?.user?.id || user?.id;

    if (customId === 'leave_modal') {
      // Log the modal submit interaction
      try {
        await prisma.commandLog.create({
          data: {
            interactionId: id,
            commandName: 'leave',
            userId,
            channelId: channel_id || '',
            payload: req.body,
          }
        });
      } catch (err) {
        if (err.code === 'P2002') {
          return res.status(200).send('Duplicate');
        }
        console.error('Failed to log leave modal submit', err);
      }

      // Respond immediately with type 5 (DEFERRED ChannelMessageWithSource) or 6 (DEFERRED UPDATE)
      // Since it's a modal from a slash command, we typically use 5 to send a new message
      res.json({ type: 5 });

      // Process the leave request in the background
      handleLeaveSubmit(req).catch(console.error);
      return;
    }
  }

  // 3 = MESSAGE_COMPONENT
  if (type === 3) {
    const customId = data.custom_id;
    const username = member?.user?.username || user?.username || 'Unknown User';

    if (customId === 'acknowledge_report') {
      const originalMessage = req.body.message;
      const content = originalMessage.content;
      
      // Respond with UPDATE_MESSAGE (type 7) to edit the message
      return res.json({
        type: 7,
        data: {
          content: `${content}\n\n✅ *Acknowledged by @${username}*`,
          components: [] // Removes the button
        }
      });
    }
  }

  // Handle other types
  if (!res.headersSent) {
    return res.status(400).send('Unhandled interaction type');
  }
});

export default router;
