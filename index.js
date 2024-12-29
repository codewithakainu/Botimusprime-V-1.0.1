require('dotenv/config');
const { Client, ActivityType, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios'); // axios

const client = new Client({
  intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

let isWelcomeEnabled = true;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL;
const SUPPORT_CHANNEL_ID = process.env.SUPPORT_CHANNEL;
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL;  

client.on('ready', () => {
  console.log(`Client is ready! Logged in as ${client.user.tag}`);

  const activities = [
    { type: ActivityType.Playing, name: "Made by 💖 codewithakainu" },
    { type: ActivityType.Watching, name: "with Groq API" },
    { type: ActivityType.Listening, name: "Managed by 🎐『Team Alpha』" },
  ];
  
  let currentIndex = 0;

  setInterval(() => {
    const activity = activities[currentIndex];
    client.user.setActivity(activity.name, { type: activity.type });
    currentIndex = (currentIndex + 1) % activities.length;
  }, 10000); // 10 seconds
});

const IGNORE_PREFIX = "!";
const ALLOWED_CHANNELS = ['1316380592593698847', '1313756471984390185'];
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'; // axios URL
const GROQ_API_KEY = process.env.GROQ_API_KEY;

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.content.startsWith(IGNORE_PREFIX)) return;

  const isAllowedChannel = ALLOWED_CHANNELS.includes(message.channelId);
  const isMentioned = message.mentions.has(client.user.id);

  if (!isAllowedChannel && !isMentioned) return;

  try {
    const payload = {
      model: 'gemma2-9b-it',
      messages: [
        {
          role: 'system',
          content: 'You are Botimusprime, a helpful assistant chatbot integrated into group discussions.',
        },
        {
          role: 'user',
          content: message.content,
        },
      ],
    };

    const response = await axios.post(GROQ_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const responseMessage = response.data?.choices?.[0]?.message?.content;

    if (responseMessage) {
      const chunkSizeLimit = 2000;

      for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
        const chunk = responseMessage.substring(i, i + chunkSizeLimit);
        await message.reply(chunk);
      }
    } else {
      console.error('No response from Groq.');
    }
  } catch (error) {
    console.error('Error interacting with Groq API:', error);
    message.reply('Sorry, I encountered an issue. Please try again later.');
  }
});

// Event 
client.on('guildMemberAdd', async (member) => {
  if (!isWelcomeEnabled) return;
// ai response 
  try {
    const payload = {
      model: 'gemma2-9b-it',
      messages: [
        {
          role: 'system',
          content: 'You are Botimusprime, a friendly bot welcoming new members to the server.',
        },
        {
          role: 'user',
          content: `Welcome message for ${member.user.username}`,
        },
      ],
    };

    const response = await axios.post(GROQ_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const welcomeMessage = response.data?.choices?.[0]?.message?.content || 'Welcome to the server!';

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Welcome ${member.user.username}!`)
      .setDescription(welcomeMessage)
      .setFooter({ text: 'Made by codewithakainu | Powered by AI' });

    const supportButton = new ButtonBuilder()
      .setLabel('Get Support from Admin')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${member.guild.id}/${SUPPORT_CHANNEL_ID}`);

    const rulesButton = new ButtonBuilder()
      .setLabel('Rules')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${member.guild.id}/${RULES_CHANNEL_ID}`);

    const row = new ActionRowBuilder().addComponents(supportButton, rulesButton);

    const welcomeChannel = await client.channels.fetch(WELCOME_CHANNEL_ID);
    if (welcomeChannel) {
      await welcomeChannel.send({ embeds: [embed], components: [row] });
    }
  } catch (error) {
    console.error('Error generating welcome message:', error);
  }
});

// Slash command wm
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'toggle-welcome') {
    isWelcomeEnabled = !isWelcomeEnabled;
    await interaction.reply({
      content: `Welcome message has been ${isWelcomeEnabled ? 'enabled' : 'disabled'}.`,
      ephemeral: true,
    });
  }
});

client.login(process.env.TOKEN);
