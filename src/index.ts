import { MessageEmbed } from 'discord.js';
import { SlasherClient } from 'discord.js-slasher';
import config from './conf';
import initDatabase, { Database } from './db';
import initImageServer, { ImageServer } from './img-api';
import commands from './commands/manager';
import discordModals from 'discord-modals';

const client = new SlasherClient({
    useAuth: true,
    intents: ['GUILDS', 'GUILD_MESSAGES']
});
const state: AppState = {
    db: null,
    imgServer: null
};

client.on("ready", () => {
    console.log("[Bot] Login successful!");
    client.user.setPresence({
        status: "online",
        activities: [{ name: "/info for commands", type: "PLAYING" }]
    });
});

client.on("messageCreate", (msg) => {
    // don't respond to self
    if(msg.author.id === client.user.id) {
        return;
    }

    // if the user tries to use the prefix, send the slash
    // command message instead
    if(msg.content.startsWith("mc?")) {
        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Use slash commands")
            .setDescription("MyMinecraft has switched to slash commands in line with Discord's new features. Please type `/info` for help.");
        msg.reply({
            embeds: [embed]
        });
    }
});

client.on("command", ctx => commands.run(ctx, state.db));
// client.on("guildCreate", commands.sendServerGreeting);

// load config and login
console.log("[Config] Checking for config file...");
config.getConfig(async (c) => {
    state.db = initDatabase(c); // pass config to database
    state.imgServer = initImageServer(c); // pass config to img api
    discordModals(client);
    client.login();
});

interface AppState {
    db?: Database;
    imgServer?: ImageServer;
};