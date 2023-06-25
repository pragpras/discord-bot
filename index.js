// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { token, api_key } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
}

client.on('messageCreate', async (message) => {
    console.log(`Received message: ${message.content}`);
    if (message.author.bot)
        return;
    if (message.content.startsWith('!recipe')) {
        const query = message.content.slice(8).trim();
        if (!query) {
            message.channel.send('Please provide a recipe query.');
            return;
        }
        try {
            const response = await axios.get(
                `https://api.spoonacular.com/recipes/complexSearch`,{
                    params: {
                        apiKey: api_key,
                        query: query,
                    },
                }
            );
            const recipes = response.data.results;
            if (recipes && recipes.length > 0) {
                recipes.forEach((recipe) => {
                    const { title, sourceURL } = recipe;
                    message.channel.send(`**${title}**\n${sourceURL}\n`);
                });
            }
            else {
                message.channel.send('No recipes found for given query.');
            }
        }
        catch (error) {
            console.error('Error retrieving recipe data: ', error);
            message.channel.send('An error occurred while fetching recipe data.');
        }
    }
});

// Log in to Discord with your client's token
client.login(token);