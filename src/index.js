const { Client } = require("discord.js");
const config = require("./conf");

let client = new Client();

client.on("ready", () => {
    console.log("[Bot] Login successful!");
});

client.on("message", (msg) => {
    // make sure the author isn't a bot
    if(msg.author.bot) {
        return;
    }
    // basic test
    msg.channel.send(`Hello ${msg.author}! You said: **${msg.content}**`);
});

// load config and login
console.log("[Config] Checking for config file...");
config.getConfig((config) => {
    client.login(config.discord.token);
});