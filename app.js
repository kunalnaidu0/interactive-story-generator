const express = require('express');
const app = express();
const bot = require('./discord-interaction.js');

// Determine the port to listen to
const PORT = process.env.PORT || 3000;

// Start the express application
app.listen(PORT, () => {
    console.log(`My first Express app - listening on port ${PORT}!`);
})

// creates an instance of the bot
const currentBot = new bot.Bot();