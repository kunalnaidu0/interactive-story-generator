const { Client, IntentsBitField, Collection, Events, GatewayIntentBits} = require('discord.js');
require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');

module.exports = {

    Bot : class {
        constructor(){
            // create instance of discord client
            this.client = new Client({
                intents: [
                    IntentsBitField.Flags.Guilds,
                    IntentsBitField.Flags.GuildMembers,
                    IntentsBitField.Flags.GuildMessages,
                    IntentsBitField.Flags.MessageContent,
                    GatewayIntentBits.Guilds,
                ]
            });

            // set up slash commands
            this.client.commands = new Collection();

            // direct the client to the commands folder
            const foldersPath = path.join(__dirname, 'commands');
            const commandFolders = fs.readdirSync(foldersPath);

            // read the command files
            for (const folder of commandFolders) {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                for ( const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    // Set a new item in the Collection with the key as the command name and the value as the exported module
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                        console.log('command loaded');
                    } else {
                        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                    }
                }
            }

            // When the client is ready, run this code (only once).
            // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
            // It makes some properties non-nullable.
            this.client.once(Events.ClientReady, readyClient => {
                console.log(`Ready! Loggin in as ${readyClient.user.tag}`);
            })

            // Log in to Discord with your client's token
            this.client.login(process.env.TOKEN);

            // check to see if the the connection with discord
            this.client.on('ready', (c) => {
                console.log(`${c.user.username} is ready!`);
            })

            // when a message is sent in the channel respond to it
            this.client.on('messageCreate', async (message) => {
                if (message.author.bot) return;
                const channel = this.client.channels.cache.get(process.env.CHANNEL_ID);
                message = "hello world";
                this.processString(message, channel);
            })

            // using slash commands
            this.client.on(Events.InteractionCreate, async interaction => {
                if (!interaction.isChatInputCommand()) return;
                console.log(interaction);
                const command = interaction.client.commands.get(interaction.commandName);
            
                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }
            
                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                }
            });
        }

        // send strings within the discord message limit
        // character limit is 2000 for discord messages
        processString (str, channel) {
            if (str.length <= 2000) {
                channel.send(str); // Print the remaining part if it's within the limit
                return;
            }
        
            // Find the last newline character within the first 2000 characters
            const cutoff = str.lastIndexOf('\n', 2000);
        
            // If no newline is found, fallback to printing the first 2000 characters
            const splitPoint = cutoff !== -1 ? cutoff + 1 : 2000;
        
            channel.send(str.slice(0, splitPoint)); // Print up to the split point
            sendSections(str.slice(splitPoint), channel); // Recurse with the remaining part of the string
        };
        
    }     

}