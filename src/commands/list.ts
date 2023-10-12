import { CommandExecutor } from "../cmds";
import { SERVER_LIMIT } from "../const";
import { listServers } from "../db";
import { EmbedBuilder } from "discord.js";

const ListCommand: CommandExecutor = async (ctx) => {
    const guild = ctx.server!.guild;
    const servers = await listServers(guild);

    // make sure there are servers added
    if(servers.length <= 0) {
        const embed = new EmbedBuilder()
            .setTitle("No servers")
            .setDescription("You haven't added any servers yet! Type `/add` to add one.")
            .setColor("Red");
        return await ctx.reply(embed);
    }

    const embed = new EmbedBuilder()
        .setTitle("Your servers")
        .setColor("Grey")
        .setDescription("Type `/status` to ping the servers and see their live status.")
        .setFooter({ text: `${servers.length} / ${SERVER_LIMIT} servers` })
        .setFields(servers.map(s => (
            { name: s.name, value: s.ip, inline: true }
        )));
    await ctx.reply(embed);
};

export default ListCommand;
