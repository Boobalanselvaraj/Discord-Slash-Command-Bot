import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID } = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_APPLICATION_ID) {
  console.error('Error: DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID must be set in .env');
  process.exit(1);
}

// Set URL to global commands or guild specific commands
// For testing, guild specific is faster. If DISCORD_GUILD_ID is provided, it uses it.
const url = process.env.DISCORD_GUILD_ID
  ? `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/guilds/${process.env.DISCORD_GUILD_ID}/commands`
  : `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`;

const commands = [
  {
    name: 'report',
    description: 'Report an issue or send a message',
    type: 1, // CHAT_INPUT
    options: [
      {
        name: 'text',
        description: 'The content of your report',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'status',
    description: 'Check the bot status',
    type: 1,
  },
  {
    name: 'leave',
    description: 'Submit a leave request',
    type: 1,
  },
  {
    name: 'roastme',
    description: 'Let the AI playfully roast you based on your username!',
    type: 1,
  }
];

const registerCommands = async () => {
  try {
    console.log(`Started refreshing application (/) commands at ${url}`);
    
    await axios.put(url, commands, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Failed to register commands:', error.response?.data || error.message);
  }
};

registerCommands();
