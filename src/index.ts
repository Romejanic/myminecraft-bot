import { SlasherClient, SlasherEvents } from "discord.js-slasher";
import { Events } from "discord.js";
import handleCommand from "./cmds";
import createLogger from "./logger";
import { BOT_VERSION } from "./const";

const logger = createLogger("Bot");
const client = new SlasherClient({});

// add client events
client.on(Events.ClientReady, () => {
    logger.info(`Logged in as ${client.user?.tag}`);
});

client.on(SlasherEvents.CommandCreate, handleCommand);

// log into Discord
logger.info(`Starting MyMinecraft v${BOT_VERSION}`);
client.login();
