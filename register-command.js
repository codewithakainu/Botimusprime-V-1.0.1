require('dotenv/config');
const { REST, Routes } = require('discord.js');

const clientId = process.env.CLIENT_ID; 
const token = process.env.TOKEN; 

const commands = [
  {
    name: 'toggle-welcome',
    description: 'Toggles the welcome message on or off.',
  },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }

})();
