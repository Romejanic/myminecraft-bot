import { MessageEmbed } from "discord.js";
import { Command } from "./manager";

const INVITE_LINK = "https://discord.com/api/oauth2/authorize?client_id=793150744533925888&permissions=3072&scope=bot%20applications.commands";
const ICON_LINK   = "https://static.wikia.nocookie.net/minecraft_gamepedia/images/2/26/Block_of_Redstone_JE2_BE2.png/revision/latest/scale-to-width-down/300?cb=20191230030530";
const EMBED_COLOR = "#4e7a39";

const InfoCommand: Command = async (ctx) => {
    // gather data for command
    const version = process.env.npm_package_version;
    const mem = process.memoryUsage();
    const links = [
        `[Invite me to your server!](${INVITE_LINK})`,
        `[Submit a bug report or feature request](https://github.com/Romejanic/myminecraft-bot/issues/new/choose)`,
        `[Check out on Github!](https://github.com/Romejanic/myminecraft-bot)`,
        `[Join the support server!](https://discord.gg/fawJ2dTxFS)`
    ];
    // create and send embed
    const embed = new MessageEmbed()
        .setTitle("MyMinecraft")
        .setColor(EMBED_COLOR)
        .setDescription("A clean and simple way to check the statuses of Minecraft servers.\n\n" + links.join("\n"))
        .setThumbnail(ICON_LINK)
        .setFooter({ text: "Created with ❤️ by @memedealer#6607" })
        .addField("Version", version, true)
        .addField("Node Version", process.version, true)
        .addField("Operating System", process.platform, true)
        .addField("Memory Usage", (100 * mem.heapUsed / mem.heapTotal).toFixed(1) + "%", true)
        .addField("Serving", ctx.client.guilds.cache.size + " servers", true)
        .addField("Environment", process.env.NODE_ENV === "production" ? "Production" : "Development", true);
    await ctx.reply(embed);
};

export default InfoCommand;