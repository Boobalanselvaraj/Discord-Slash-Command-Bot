import { sendNotification } from '../utils/webhook.js';
import prisma from '../config/prisma.js';
import { analyzeCommand } from '../utils/groq.js';

const editDiscordResponse = async (applicationId, token, content) => {
  try {
    await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}/messages/@original`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
  } catch (err) {
    console.error('Failed to edit Discord response:', err);
  }
};

const checkConfig = async (commandName) => {
  const config = await prisma.commandConfig.findUnique({ where: { command: commandName } });
  return config || { isEnabled: true, replyText: null }; // Default behavior
};

export const handleReportCommand = async (req) => {
  const { data, id, token, application_id } = req.body;
  const options = data.options || [];
  const textOption = options.find(opt => opt.name === 'text');
  const reportText = textOption ? textOption.value : 'No text provided';

  const config = await checkConfig('report');
  if (!config.isEnabled) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed' }});
    return editDiscordResponse(application_id, token, 'This command is currently disabled by an admin.');
  }

  try {
    // Generate AI analysis
    const aiAnalysis = await analyzeCommand('report', reportText);

    // Send notification to secondary channel
    await sendNotification(`New Report: ${reportText}\n🧠 **AI Triage:** ${aiAnalysis || 'N/A'}`);
    
    // Update status and AI analysis in DB
    await prisma.commandLog.update({
      where: { interactionId: id },
      data: { status: 'success', aiAnalysis }
    });

    await editDiscordResponse(application_id, token, `Report received: "${reportText}" and mirrored successfully!\n🧠 **AI Triage:** ${aiAnalysis || 'N/A'}`);
  } catch (err) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed' }});
    await editDiscordResponse(application_id, token, 'Failed to process report. The backend webhook may be down.');
  }
};

export const handleStatusCommand = async (req) => {
  const { id, token, application_id } = req.body;

  const config = await checkConfig('status');
  if (!config.isEnabled) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed' }});
    return editDiscordResponse(application_id, token, 'This command is currently disabled by an admin.');
  }

  await prisma.commandLog.update({
    where: { interactionId: id },
    data: { status: 'success' }
  });

  const reply = config.replyText || 'Bot is online and fully operational.';
  await editDiscordResponse(application_id, token, reply);
};

export const handleLeaveSubmit = async (req) => {
  const { data, id, token, application_id, member, user } = req.body;
  const username = member?.user?.username || user?.username || 'Unknown User';
  
  // Extract values from modal components
  let startDate = '', endDate = '', reason = '';
  if (data.components) {
    for (const row of data.components) {
      for (const comp of row.components) {
        if (comp.custom_id === 'start_date') startDate = comp.value;
        if (comp.custom_id === 'end_date') endDate = comp.value;
        if (comp.custom_id === 'reason') reason = comp.value;
      }
    }
  }

  const config = await checkConfig('leave');
  if (!config.isEnabled) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed' }});
    return editDiscordResponse(application_id, token, 'This command is currently disabled by an admin.');
  }

  // Date Validation Helper
  const isValidDate = (dateString) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
    const [year, month, day] = dateString.split('-').map(Number);
    if (year < 2000 || year > 3000 || month < 1 || month > 12) return false;
    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;
    return day > 0 && day <= monthLength[month - 1];
  };

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed', aiAnalysis: 'Failed due to invalid date format.' }});
    return editDiscordResponse(application_id, token, '❌ **Invalid date format.** Please use a valid calendar date in `YYYY-MM-DD` format (e.g., 2024-05-01).');
  }

  if (new Date(startDate) > new Date(endDate)) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed', aiAnalysis: 'Failed due to end date being before start date.' }});
    return editDiscordResponse(application_id, token, '❌ **Invalid date range.** The end date cannot be earlier than the start date.');
  }

  try {
    // Generate AI analysis
    const aiAnalysis = await analyzeCommand('leave', `Start: ${startDate}, End: ${endDate}, Reason: ${reason}`);

    const formattedMessage = `**New Leave Request** from @${username}\n📅 **Start:** ${startDate}\n📅 **End:** ${endDate}\n📝 **Reason:** ${reason}\n🧠 **AI Insights:** ${aiAnalysis || 'N/A'}`;
    await sendNotification(formattedMessage);
    
    await prisma.commandLog.update({
      where: { interactionId: id },
      data: { status: 'success', aiAnalysis }
    });

    await editDiscordResponse(application_id, token, `✅ Your leave request from **${startDate}** to **${endDate}** has been submitted to management.\n🧠 **AI Insights:** ${aiAnalysis || 'N/A'}`);
  } catch (err) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed' }});
    await editDiscordResponse(application_id, token, '❌ Failed to submit leave request. The backend webhook may be down.');
  }
};

export const handleRoastMeCommand = async (req) => {
  const { id, token, application_id, member, user } = req.body;
  const username = member?.user?.username || user?.username || 'Unknown User';

  const config = await checkConfig('roastme');
  if (!config.isEnabled) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed' }});
    return editDiscordResponse(application_id, token, 'This command is currently disabled by an admin.');
  }

  try {
    // Generate AI roast
    const aiRoast = await analyzeCommand('roastme', username);
    
    // Update status in DB
    await prisma.commandLog.update({
      where: { interactionId: id },
      data: { status: 'success', aiAnalysis: aiRoast }
    });

    await editDiscordResponse(application_id, token, aiRoast);
  } catch (err) {
    await prisma.commandLog.update({ where: { interactionId: id }, data: { status: 'failed' }});
    await editDiscordResponse(application_id, token, '❌ Failed to generate roast. The AI might be taking a break.');
  }
};
