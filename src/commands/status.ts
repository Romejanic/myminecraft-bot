import { CommandExecutor } from "cmds";
import { BUG_REPORTS, INT_TIMEOUT, Maybe, SERVER_LIMIT } from "const";
import { Server, listServers } from "db";
import { APIEmbedField, ActionRowBuilder, AttachmentBuilder, ComponentType, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import createLogger from "logger";
import { Data, pingPromise } from "minecraft-pinger";
import { parseIpString, convertTextComponent, attachEncodedImage } from "../util";
import { format } from "mc-chat-format";

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
    let pingData = pingServers(servers, onPingDataReturned);
    let updatingEmbed = false;
    let needsUpdate = false;
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
        updatingEmbed = true;
        const files: AttachmentBuilder[] = [];

        // clear fields and thumbnail
        embed.setFields([]).setThumbnail(null);

        if(!selectedId) {
            // show all servers
            embed.setTitle("Servers Status")
                .setDescription(null)
                .setFields(servers.map(s => (
                    { name: s.name, value: formatStatusShort(pingData[s.id]), inline: true }
                )))
                .setColor("Yellow")
                .setFooter({ text: `${servers.length} / ${SERVER_LIMIT} servers` });
        } else {
            // show single server status
            const server = servers.find(s => s.id === selectedId);
            if(server) {
                const serverPing = pingData[server?.id];
                const fields: APIEmbedField[] = [
                    { name: "Address", value: server.ip, inline: true }
                ];
                let motdString = "";
                if(serverPing.data) {
                    fields.push(
                        { name: "Ping", value: `${serverPing.data.ping}ms`, inline: true },
                        { name: "Player Count", value: `${serverPing.data.players.online} / ${serverPing.data.players.max}`, inline: true },
                        { name: "Version", value: `${serverPing.data.version.name} (${serverPing.data.version.protocol})`, inline: true }
                    );
                    if(serverPing.data.description) {
                        motdString = `\n\n**Description**\n\`\`\`\n${format(convertTextComponent(serverPing.data)).split("\n").map(s => s.trim()).join("\n")}\n\`\`\``;
                    }
                    if(serverPing.data.favicon) {
                        const [iconName, icon] = attachEncodedImage(serverPing.data.favicon);
                        embed.setThumbnail(iconName);
                        files.push(icon);
                    }
                }
                const statusString = serverPing.state === "success" ? "Online!" : serverPing.state === "failure" ? "Cannot reach server\n\nIt may be offline or unavailable." : "Pinging...";
                embed.setTitle(`${server.name} Status`)
                    .setDescription(`${statusIcon(serverPing.state)} ${statusString}${motdString}`)
                    .setColor(serverPing.state === "pending" ? "Yellow" : serverPing.state === "failure" ? "Red" : "Green")
                    .setFooter(null)
                    .setFields(fields);
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

        // if needed, update the interaction or message
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

        // decide if we need to re-update the embed
        updatingEmbed = false;
        if(needsUpdate) {
            needsUpdate = false;
            await updateEmbed();
        }
    }
    updateEmbed();

    function onPingDataReturned() {
        if(!updatingEmbed) updateEmbed();
        else needsUpdate = true;
    }

    // send initial response
    message = await ctx.reply({
        embeds: [embed],
        components: [selectRow]
    }) as Message;

    // create interaction collector
    const collect = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: i => i.customId === "server",
        time: INT_TIMEOUT
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

type PingStatus = "pending" | "success" | "failure";

interface PendingData {
    state: PingStatus;
    data?: Data;
}

function pingServers(servers: Server[], onUpdate: () => unknown) {
    const statusObj: Record<number, PendingData> = {};
    for(let server of servers) {
        statusObj[server.id] = { state: "pending" };
        const [ip, port] = parseIpString(server.ip);
        pingPromise(ip, port)
            .then(data => statusObj[server.id] = { state: "success", data })
            .catch(_ => statusObj[server.id] = { state: "failure" })
            .finally(onUpdate);
    }
    return statusObj;
}

function statusIcon(status: PingStatus) {
    switch(status) {
        case "success": return "✅";
        case "failure": return "❌";
        case "pending": return "⏳";
        default: return "?";
    }
}

function formatStatusShort(data: PendingData) {
    if(data.state === "success") return `${statusIcon(data.state)} ${data.data?.ping}ms`;
    if(data.state === "failure") return `${statusIcon(data.state)} Offline`;
    return `${statusIcon(data.state)} Pinging...`;
}

export default StatusCommand;
