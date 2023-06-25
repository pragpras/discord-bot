const { Client, EmbedBuilder, Events, GatewayIntentBits } = require('discord.js');
const { request } = require('undici');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

    if (commandName === 'cat') {
		const catResult = await request('https://aws.random.cat/meow');
		const { file } = await catResult.body.json();
		interaction.editReply({ files: [file] });
	}

	const { commandName } = interaction;
	await interaction.deferReply();
	// ...
});

client.login('your-token-goes-here');
