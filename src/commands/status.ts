import { CommandExecutor } from "cmds";
import { Maybe, SERVER_LIMIT } from "const";
import { listServers } from "db";
import { ActionRowBuilder, ComponentType, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import createLogger from "logger";

const logger = createLogger("StatusCmd");

const StatusCommand: CommandExecutor = async (ctx) => {
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
    let message: Maybe<Message> = null;
    const embed = new EmbedBuilder();

    // create dropdown menu
    const selectMenu = new StringSelectMenuBuilder({
        customId: "server",
        minValues: 0,
        maxValues: 1,
        placeholder: "Choose server"
    });
    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    // update embed data
    async function updateEmbed(i?: StringSelectMenuInteraction) {
        if(!selectedId) {
            // show all servers
            embed.setTitle("Servers Status")
                .setFields(servers.map(s => (
                    { name: s.name, value: `Status`, inline: true }
                )))
                .setColor("Yellow")
                .setFooter({ text: `${servers.length} / ${SERVER_LIMIT} servers` });
        } else {
            // show single server status
            const server = servers.find(s => s.id === selectedId);
            if(server) {
                embed.setTitle(`${server.name} Status`)
                    .setDescription(`${server.ip}`)
                    .setColor("Red")
                    .setFooter(null)
                    .setFields([]);
            } else {
                logger.error("Got invalid server ID somehow, ID:", selectedId);
                embed.setTitle("Invalid server")
                    .setDescription("The server you selected is invalid. This is probably a bug, please report it.")
                    .setColor("Red")
                    .setFooter(null)
                    .setFields([]);
            }
        }

        // redefine the dropdown options so the server stays selected
        selectMenu.setOptions(servers.map(s => (
            { label: s.name, description: s.ip, value: String(s.id), default: s.id === selectedId }
        )));

        // if needed, update the interaction or message
        if(i) {
            await i.update({
                embeds: [embed],
                components: [selectRow]
            });
        } else if(message) {
            await message.edit({
                embeds: [embed],
                components: [selectRow]
            });
        }
    }
    updateEmbed();

    // send initial response
    message = await ctx.reply({
        embeds: [embed],
        components: [selectRow]
    }) as Message;

    // create interaction collector
    const collect = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: i => i.customId === "server"
    });

    collect.on("collect", async i => {
        if(!i.isStringSelectMenu()) return;
        if(i.values.length > 0) {
            selectedId = Number(i.values[0]);
        } else {
            selectedId = null;
        }
        await updateEmbed(i);
    });

    collect.on("end", async _ => {
        // remove dropdown component
        await ctx.edit({
            embeds: [embed],
            components: []
        });
    });
};

export default StatusCommand;
