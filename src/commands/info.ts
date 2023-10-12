// import { heapStats } from "bun:jsc";
import Bun from "../bun-polyfill";
import { CommandExecutor } from "../cmds";
import { INVITE_LINK, BUG_REPORTS, GITHUB_LINK, SUPPORT_SERVER, botIcon, EMBED_COLOR, BOT_VERSION } from "../const";
import { EmbedBuilder } from "discord.js";

const InfoCommand: CommandExecutor = async (ctx) => {
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
    const embed = new EmbedBuilder()
        .setTitle("MyMinecraft")
        .setColor(EMBED_COLOR)
        .setDescription("A clean and simple way to check the statuses of Minecraft servers.\n\n" + links.join("\n"))
        .setThumbnail(iconName)
        .setFooter({ text: "Created with ❤️ by @memedealer5011" })
        .addFields([
            { name: "Version", value: BOT_VERSION, inline: true },
            { name: "Bun Version", value: Bun.version, inline: true },
            { name: "Operating System", value: process.platform, inline: true },
            { name: "Memory Usage", value: `${(mem.heapUsed * 100 / mem.heapTotal).toFixed(2)}%`, inline: true },
            { name: "Serving", value: `${ctx.client.guilds.cache.size} servers`, inline: true },
            { name: "Environment", value: Bun.env.NODE_ENV === "production" ? "Production" : "Development", inline: true }
        ]);
    await ctx.reply({
        embeds: [embed],
        files: [icon]
    });
};

export default InfoCommand;
