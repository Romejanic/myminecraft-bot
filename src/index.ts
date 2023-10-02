import { SlasherClient, SlasherEvents } from "discord.js-slasher";
import { Events } from "discord.js";
import handleCommand from "cmds";

const client = new SlasherClient({});

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on(SlasherEvents.CommandCreate, handleCommand);

client.login();
