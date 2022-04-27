import { MessageEmbed } from "discord.js";
import { EMBED_COLOR } from "../const";
import { Command } from "./manager";

const ListCommand: Command = async (ctx, db) => {
    const servers = await db.getServers(ctx.server.id);

    // check if there's no servers
    if(servers.length <= 0) {
        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("No servers!")
            .setDescription("You don't have any servers added yet. Please type `/add` to add a server.");
        return await ctx.reply(embed, true);
    }

    // format server list
    const embed = new MessageEmbed()
        .setTitle("Server List")
        .setColor(EMBED_COLOR)
        .setDescription("For more information about a server, type `/status Single server` and select the server.")
        .setFooter({ text: `${servers.length} / 5 server slots used` })
        .setFields(servers.map(val => {
            return { name: val.name, value: val.ip, inline: true };
        }));
    await ctx.reply(embed);
};

export default ListCommand;