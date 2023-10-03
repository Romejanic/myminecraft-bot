import { CommandExecutor } from "cmds";
import { Maybe } from "const";
import { listServers } from "db";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import createLogger from "logger";

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

    const embed = new EmbedBuilder()
        .setTitle("Choose server")
        .setDescription("Please select the server you'd like to remove")
        .setColor("Grey");

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

    async function updateEmbed(i?: StringSelectMenuInteraction) {
        if(selectedId) {
            const server = servers.find(s => s.id === selectedId);
            if(server) {
                embed.setTitle("Confirm delete")
                    .setDescription(`Are you sure you want to delete ${server.name}?`)
                    .setColor("Red");
            } else {
                logger.error("Got invalid server ID somehow, ID:", selectedId);
                embed.setTitle("Invalid server")
                    .setDescription(`The server you selected is invalid. This is probably a bug, please report it.\n\n[Click here](${BUG_REPORTS}) to submit a bug report.`)
                    .setColor("Red")
                    .setFooter(null)
                    .setFields([]);
            }
        }

        // update options so the chosen server stays selected
        selectMenu.setOptions(servers.map(s => (
            { label: s.name, description: s.ip, value: String(s.id), default: s.id === selectedId }
        )));

        if(i) await i.update({
            embeds: [embed],
            components: [selectRow, buttonRow]
        });
    }

    // send initial embed
    const msg = await ctx.reply({
        embeds: [embed],
        components: [selectRow]
    }) as Message;

    const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: i => i.customId === "server"
    });

    collector.on("collect", async i => {
        if(i.isStringSelectMenu()) {
            if(i.values.length > 0) selectedId = Number(i.values[0]);
            else selectedId = null;
            await updateEmbed(i);
        }
    });

    collector.on("end", async () => {
        // remove components
        await msg.edit({
            embeds: [embed],
            components: []
        });
    });

};

export default RemoveCommand;
