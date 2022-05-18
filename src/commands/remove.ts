import { Message, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { Command } from "./manager";
import Util from "./util";

const RemoveCommand: Command = async (ctx, db) => {
    const servers = await db.getServers(ctx.server.id);

    // check if there are no servers
    if(servers.length <= 0) {
        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("No servers!")
            .setDescription("You don't have any servers added yet. Please type `/add` to add a server.");
        return await ctx.reply(embed, true);
    }

    // step 1: select the server to remove
    const embed = new MessageEmbed()
        .setColor("YELLOW")
        .setTitle("Select a server")
        .setDescription("Please choose a server from the dropdown below to remove");

    const selectMenu = new MessageSelectMenu()
        .setCustomId("choose_server")
        .setPlaceholder("Choose a server...")
        .setOptions(Util.serversToDropdown(servers));

    const msg = await ctx.reply({
        embeds: [embed],
        components: [
            new MessageActionRow().addComponents(selectMenu)
        ],
        fetchReply: true
    }) as Message;

    // step 2: wait for user to select an option
    const selectCollector = msg.createMessageComponentCollector({
        filter: i => i.isSelectMenu() && i.customId === selectMenu.customId,
        time: 10 * 60 * 1000 // 10 minutes
    });

    selectCollector.on("collect", async i => {
        if(i.user.id === ctx.user.id) {
            const selectInt = i as SelectMenuInteraction;
            await i.reply(selectInt.values[0]);
            selectCollector.stop("interacted");
        } else {
            // send error if different user interacts
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Not your request")
                .setDescription("Only the person who made this request can interact with it!");
            await i.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    });

    // handle interaction time out
    selectCollector.on("end", async (_, reason) => {
        if(reason !== "interacted") {
            embed.setColor("RED")
                .setTitle("Request expired")
                .setDescription("The request has expired because you didn't interact within 10 minutes.\n\nRun `/remove` again to start over.");
            await msg.edit({
                embeds: [embed],
                components: []
            });
        }
    });
};

export default RemoveCommand;