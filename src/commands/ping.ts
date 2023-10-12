import { CommandExecutor } from "../cmds";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { attachEncodedImage, convertTextComponent, parseIpString, stripMinecraftText, stripTextComponent } from "../util";
import { ping, pingPromise } from "minecraft-pinger";
import { statusIcon } from "../pinger";

const PingCommand: CommandExecutor = async (ctx) => {
    const address = ctx.options.getString("address", true);

    // send inital embed
    const embed = new EmbedBuilder()
        .setTitle("Pinging...")
        .setDescription(`${statusIcon("pending")} Pinging server \`${address}\`, please wait...`)
        .setColor("Yellow");
    await ctx.reply(embed);

    // ping the server
    const files: AttachmentBuilder[] = [];
    try {
        const [ ip, port ] = parseIpString(address);
        const pingData = await pingPromise(ip, port);

        let motdString = "";
        if(pingData.description) {
            motdString = `\n\n**Description**\n\`\`\`\n${stripTextComponent(convertTextComponent(pingData))}\n\`\`\``;
        }
        if(pingData.favicon) {
            const [iconName, icon] = attachEncodedImage(pingData.favicon);
            embed.setThumbnail(iconName);
            files.push(icon);
        }

        embed.setTitle(`${address} Status`)
            .setDescription(`${statusIcon("success")} Online!${motdString}`)
            .setColor("Green")
            .setFields([
                { name: "Ping", value: `${pingData.ping}ms`, inline: true },
                { name: "Player Count", value: `${pingData.players.online} / ${pingData.players.max}`, inline: true },
                { name: "Version", value: `${stripMinecraftText(pingData.version.name)} (${pingData.version.protocol})`, inline: true }
            ]);
    } catch(e) {
        // probably couldn't reach the server
        embed.setTitle("Cannot reach server!")
            .setDescription(`${statusIcon("failure")} The server at \`${address}\` couldn't be reached. It may be offline or unavailable.`)
            .setColor("Red");
    }

    // update the embed
    await ctx.edit({
        embeds: [embed],
        files
    });
};

export default PingCommand;
