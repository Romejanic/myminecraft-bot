import { Client } from 'discord.js';
import config from './conf';
// import commands from './commands';

let db = require("./db");
let imgServer = require("./img-api");
let client = new Client({ intents: ['GUILDS'] });

client.on("ready", () => {
    console.log("[Bot] Login successful!");
    client.user.setPresence({
        status: "online",
        activities: [{ name: "mc?help for commands", type: "PLAYING" }]
    });
});

client.on("message", (msg) => {
    // make sure the author isn't a bot
    if(msg.author.bot || msg.content.startsWith("mc?proxy")) {
        // commands.checkProxy(msg, client, db, imgServer);
        return;
    }
    // check the channel is valid
    // if(!commands.isChannelValid(msg.channel)) {
    //     commands.sendDmError(msg.channel);
    //     return;
    // }
    // check if the prefix is matched
    // let text = msg.content.trim();
    // if(commands.matchPrefix(text)) {
    //     let wizardsOps = { msg, client };
    //     // pass the text off to be parsed as a command
    //     commands.parse(text, msg, db, imgServer, wizardsOps).catch((e: Error) => {
    //         console.error("Unexpected error while processing command!", e);
    //         commands.sendError(msg.channel, "Sorry, something went wrong while performing that command!");
    //     });
    // }
});

// client.on("guildCreate", commands.sendServerGreeting);

// load config and login
console.log("[Config] Checking for config file...");
config.getConfig(async (c) => {
    db = db(c); // pass config to database
    imgServer = imgServer(c); // pass config to img api
    client.login(c.discord.token);
});