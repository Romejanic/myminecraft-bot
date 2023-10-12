import { CommandExecutor } from "../cmds";
import { BUG_REPORTS, INT_TIMEOUT, Maybe } from "../const";
import { listServers } from "../db";
import { ActionRowBuilder, AttachmentBuilder, ComponentType, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import createLogger from "../logger";
import { attachEncodedImage, stripMinecraftText } from "../util";
import pingServers, { statusIcon } from "../pinger";

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
    const pingData = pingServers(servers, onPingDataReturned);
    let updatingEmbed = false;
    let needsUpdate = false;
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

    async function updateEmbed(i?: StringSelectMenuInteraction) {
        updatingEmbed = true;
        let files: AttachmentBuilder[] = [];

        if(!selectedId) {
            embed.setTitle("Player counts")
                    .setDescription("To see the list of online players for a single server, choose it from the dropdown.")
                    .setColor("Grey")
                    .setFields(servers.map(s => {
                        const ping = pingData[s.id];
                        const players = ping.data ? ping.data.players : null;
                        return {
                            name: s.name,
                            value: `${statusIcon(pingData[s.id].state)}${players ? ` ${players.online} / ${players.max}` : ""}`,
                            inline: true
                        }
                    }));
        } else {
            const selectedServer = servers.find(s => s.id === selectedId);
            if(selectedServer) {
                const serverPing = pingData[selectedServer.id];
                const playerSample = serverPing.data?.players.sample;
                const sampleString = playerSample && playerSample.length > 0 ? `**Player Sample**\n\`\`\`\n${stripMinecraftText(playerSample.map(s => s.name).join("\n"))}\n\`\`\``
                                    : "No player sample available";
                const statusText = serverPing.state === "success" ? `Online\n\n${sampleString}`
                                : serverPing.state === "failure" ? "Cannot reach server"
                                : "Pinging...";

                embed.setTitle(`${selectedServer.name} Players`)
                    .setDescription(`${statusIcon(serverPing.state)} ${statusText}`)
                    .setColor(serverPing.state === "pending" ? "Yellow" : serverPing.state === "failure" ? "Red" : "Green")
                    .setFields(serverPing.data ? [
                        { name: "Player Count", value: `${serverPing.data?.players.online} / ${serverPing.data.players.max}`, inline: true }
                    ] : []);
                
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

        // update interaction if provided or message
        if(i) {
            await i.update({
                embeds: [embed],
                components: [selectRow],
                files
            });
        } else if(message) {
            await message.edit({
                embeds: [embed],
                components: [selectRow],
                files
            });
        }

        // re-update the embed if needed
        updatingEmbed = false;
        if(needsUpdate) {
            needsUpdate = false;
            updateEmbed();
        }
    }
    updateEmbed();

    function onPingDataReturned() {
        if(!updatingEmbed) updateEmbed();
        else needsUpdate = true;
    }

    message = await ctx.reply({
        embeds: [embed],
        components: [selectRow]
    }) as Message;

    // add handler to respond to select menu
    const collector = message.createMessageComponentCollector({
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
        if(message) await message.edit({
            embeds: [embed],
            components: []
        });
    });
};

export default PlayersCommand;
