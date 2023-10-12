import { CommandExecutor } from "../cmds";
import { Maybe, BUG_REPORTS, INT_TIMEOUT } from "../const";
import { deleteServer, listServers } from "../db";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import createLogger from "../logger";
import { attachEncodedImage } from "../util";

const logger = createLogger("RemoveCmd");

const RemoveCommand: CommandExecutor = async (ctx) => {
    const guild = ctx.server!.guild;
    const servers = await listServers(guild);

    // make sure there are servers added
    if(servers.length <= 0) {
        const embed = new EmbedBuilder()
            .setTitle("No servers")
            .setDescription("You haven't added any servers yet, so there are none to remove.")
            .setColor("Red");
        return await ctx.reply(embed);
    }

    const embed = new EmbedBuilder();

    // create the dropdown menu
    const selectMenu = new StringSelectMenuBuilder({
        customId: "server",
        minValues: 1,
        maxValues: 1,
        placeholder: "Choose server"
    });
    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    // create the confirm/delete buttons
    const confirmBtn = new ButtonBuilder({
        customId: "delete_confirm",
        label: "Delete",
        style: ButtonStyle.Danger
    });
    const cancelBtn = new ButtonBuilder({
        customId: "delete_cancel",
        label: "Cancel",
        style: ButtonStyle.Secondary
    });
    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmBtn, cancelBtn);

    // persistent state
    let selectedId: Maybe<number> = null;
    let ended = false;

    async function updateEmbed(i?: StringSelectMenuInteraction) {
        let files: AttachmentBuilder[] = [];

        if(selectedId) {
            const server = servers.find(s => s.id === selectedId);
            if(server) {
                embed.setTitle("Confirm delete")
                    .setDescription(`Are you sure you want to delete ${server.name}?`)
                    .setColor("Red")
                    .setFields([
                        { name: "Address", value: server.ip, inline: true }
                    ]);
                // add cached icon if it exists
                if(server.icon_cache) {
                    const [ iconName, icon ] = attachEncodedImage(server.icon_cache);
                    files.push(icon);
                    embed.setThumbnail(iconName);
                }
            } else {
                logger.error("Got invalid server ID somehow, ID:", selectedId);
                embed.setTitle("Invalid server")
                    .setDescription(`The server you selected is invalid. This is probably a bug, please report it.\n\n[Click here](${BUG_REPORTS}) to submit a bug report.`)
                    .setColor("Red")
                    .setFooter(null)
                    .setFields([]);
            }
        } else {
            embed.setTitle("Choose server")
                .setDescription("Please select the server you'd like to remove")
                .setColor("Grey");
        }

        // update options so the chosen server stays selected
        selectMenu.setOptions(servers.map(s => (
            { label: s.name, description: s.ip, value: String(s.id), default: s.id === selectedId }
        )));

        if(i) await i.update({
            embeds: [embed],
            components: [selectRow, buttonRow],
            files
        });
    }

    // send initial embed
    await updateEmbed();
    const msg = await ctx.reply({
        embeds: [embed],
        components: [selectRow]
    }) as Message;

    const collector = msg.createMessageComponentCollector({
        filter: i => ["server","delete_confirm","delete_cancel"].includes(i.customId),
        time: INT_TIMEOUT
    });

    collector.on("collect", async i => {
        if(i.isStringSelectMenu()) {
            if(i.values.length > 0) selectedId = Number(i.values[0]);
            else selectedId = null;
            await updateEmbed(i);
        } else if(i.isButton()) {
            // get the selected server
            const selectedServer = servers.find(s => s.id === selectedId);
            if(!selectedServer) {
                embed.setTitle("Invalid server")
                    .setDescription(`You haven't picked a valid server. This is probably a bug, [please report it](${BUG_REPORTS}).`)
                    .setColor("Red");
                logger.error("Got invalid server ID somehow, ID:", selectedId);
            } else if(i.customId === "delete_confirm") {
                // try to delete the server
                if(await deleteServer(selectedServer)) {
                    embed.setTitle("Deleted!")
                        .setDescription(`The server ${selectedServer.name} was successfully deleted.`)
                        .setColor("Green");
                } else {
                    // server couldn't be deleted
                    embed.setTitle("Something went wrong")
                        .setDescription(`Failed to delete server ${selectedServer.name}. Try again in a few minutes. If the issue continues, please [report the bug](${BUG_REPORTS}).`)
                        .setColor("Red");
                }
            } else {
                // user cancelled the deletion
                embed.setTitle("Cancelled")
                    .setDescription(`The server ${selectedServer.name} will not be deleted.\n\nType \`/remove\` to start over.`)
                    .setColor("Red");
            }
            await i.update({
                embeds: [embed],
                components: []
            });
            ended = true;
            collector.stop();
        }
    });

    collector.on("end", async () => {
        if(ended) return;
        // remove components
        embed.setFooter({ text: "Request expired. Type /remove to start a new one." });
        await msg.edit({
            embeds: [embed],
            components: []
        });
    });

};

export default RemoveCommand;
