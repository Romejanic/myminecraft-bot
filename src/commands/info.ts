import { MessageEmbed } from "discord.js";
import { Command } from "./manager";

import { EMBED_COLOR, INVITE_LINK, BUG_REPORTS, GITHUB_LINK, SUPPORT_SERVER, botIcon } from '../const';

const InfoCommand: Command = async (ctx) => {
    // gather data for command
    const mem = process.memoryUsage();
    const links = [
        `[Invite me to your server!](${INVITE_LINK})`,
        `[Submit a bug report or feature request](${BUG_REPORTS})`,
        `[Check out on Github!](${GITHUB_LINK})`,
        `[Join the support server!](${SUPPORT_SERVER})`
    ];
    // create and send embed
    const [iconName, icon] = botIcon();
    const embed = new MessageEmbed()
        .setTitle("MyMinecraft")
        .setColor(EMBED_COLOR)
        .setDescription("A clean and simple way to check the statuses of Minecraft servers.\n\n" + links.join("\n"))
        .setThumbnail(iconName)
        .setFooter({ text: "Created with ❤️ by @memedealer#6607" })
        .addField("Version", process.env.npm_package_version, true)
        .addField("Node Version", process.version, true)
        .addField("Operating System", process.platform, true)
        .addField("Memory Usage", (100 * mem.heapUsed / mem.heapTotal).toFixed(1) + "%", true)
        .addField("Serving", ctx.client.guilds.cache.size + " servers", true)
        .addField("Environment", process.env.NODE_ENV === "production" ? "Production" : "Development", true);
    await ctx.reply({
        embeds: [embed],
        files: [icon]
    });
};

export default InfoCommand;