const { Client } = require("discord.js");
const config = require("./conf");
const commands = require("./commands");

let db = require("./db");
let client = new Client();

client.on("ready", () => {
    console.log("[Bot] Login successful!");
    client.user.setPresence({
        activity: { name: "mc?help for commands", type: "PLAYING" },
        status: "online"
    }).catch(console.error);
});

client.on("message", (msg) => {
    // make sure the author isn't a bot
    if(msg.author.bot) {
        return;
    }
    // check the channel is valid
    if(!commands.isChannelValid(msg.channel)) {
        commands.sendDmError(msg.channel);
        return;
    }
    // check if the prefix is matched
    let text = msg.content.trim();
    if(commands.matchPrefix(text)) {
        // pass the text off to be parsed as a command
        commands.parse(text, msg, db).catch((e) => {
            console.error("Unexpected error while processing command!", e);
            commands.sendError(msg.channel, "Sorry, something went wrong while performing that command!");
        });
    }
});

// load config and login
console.log("[Config] Checking for config file...");
config.getConfig((c) => {
    db = db(c); // pass config to database
    client.login(c.discord.token);
});