import { CommandExecutor } from "cmds";
import { BUG_REPORTS, INT_TIMEOUT, Maybe } from "const";
import { listServers } from "db";
import { ActionRowBuilder, AttachmentBuilder, ComponentType, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import createLogger from "logger";
import { attachEncodedImage } from "../util";

const logger = createLogger("PlayersCmd");

const PlayersCommand: CommandExecutor = async (ctx) => {
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

    // persistent state
    let selectedId: Maybe<number> = null;
    const embed = new EmbedBuilder();

    // create dropdown menu
    const selectMenu = new StringSelectMenuBuilder({
        customId: "server",
        minValues: 0,
        maxValues: 1,
        placeholder: "Choose server"
    });
    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    async function updateEmbed(i?: StringSelectMenuInteraction) {
        let files: AttachmentBuilder[] = [];

        if(!selectedId) {
            embed.setTitle("Choose server")
                    .setDescription("Please select the server you'd like to check the player sample of.")
                    .setColor("Grey");
        } else {
            const selectedServer = servers.find(s => s.id === selectedId);
            if(selectedServer) {
                embed.setTitle(`${selectedServer.name} Players`)
                    .setDescription("Players")
                    .setColor("Green");
                
                // add cached server icon if it exists
                if(selectedServer.icon_cache) {
                    const [iconName, icon] = attachEncodedImage(selectedServer.icon_cache);
                    embed.setThumbnail(iconName);
                    files.push(icon);
                }
            } else {
                logger.error("Got invalid server ID somehow, ID:", selectedId);
                embed.setTitle("Invalid server")
                    .setDescription(`The server you selected is invalid. This is probably a bug, please report it.\n\n[Click here](${BUG_REPORTS}) to submit a bug report.`)
                    .setColor("Red")
                    .setFooter(null)
                    .setFields([]);
            }
        }

        // redefine the dropdown options so the server stays selected
        selectMenu.setOptions(servers.map(s => (
            { label: s.name, description: s.ip, value: String(s.id), default: s.id === selectedId }
        )));

        // update interaction if provided
        if(i) await i.update({
            embeds: [embed],
            components: [selectRow],
            files
        });
    }
    updateEmbed();

    const msg = await ctx.reply({
        embeds: [embed],
        components: [selectRow]
    }) as Message;

    // add handler to respond to select menu
    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: i => i.customId === "server",
        time: INT_TIMEOUT
    });

    collector.on("collect", async i => {
        if(i.values.length > 0) selectedId = Number(i.values[0]);
        else selectedId = null;
        await updateEmbed(i);
    });

    collector.on("end", async () => {
        // remove components which are no longer active
        embed.setFooter({ text: "Request expired. Type /players to start a new one." });
        await msg.edit({
            embeds: [embed],
            components: []
        });
    });
};

export default PlayersCommand;
