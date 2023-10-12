import { CommandExecutor } from "../cmds";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { pingPromise, Data } from "minecraft-pinger";
import { format } from 'mc-chat-format';
import { attachEncodedImage, convertTextComponent, getButtonPress, parseIpString } from "../util";
import createLogger from "../logger";
import { addServer, countServers } from "../db";
import { SERVER_LIMIT } from "../const";

const logger = createLogger("AddCmd");

const AddCommand: CommandExecutor = async (ctx) => {
    const guild = ctx.server!.guild;

    // check that the server hasn't reached it's limit
    if(await countServers(guild) >= SERVER_LIMIT) {
        const embed = new EmbedBuilder()
            .setTitle("Too many servers!")
            .setDescription(`You've reached your ${SERVER_LIMIT} server limit. Use \`/remove\` to remove one first.`)
            .setColor("Red");
        return await ctx.reply(embed);
    }

    // create the modal
    const nameField = new TextInputBuilder({
        customId: "name",
        style: TextInputStyle.Short,
        label: "Server Name",
        placeholder: "e.g. Hypixel",
        required: true,
        maxLength: 30
    });
    const ipField = new TextInputBuilder({
        customId: "ip",
        style: TextInputStyle.Short,
        label: "Server Address",
        placeholder: "e.g. hypixel.net",
        required: true,
        maxLength: 255
    });

    const modal = new ModalBuilder({
        customId: "add_server",
        title: "Add Server",
        components: [
            new ActionRowBuilder<TextInputBuilder>().addComponents(nameField),
            new ActionRowBuilder<TextInputBuilder>().addComponents(ipField)
        ]
    });

    // get the response of the modal
    let response: ModalSubmitInteraction | null = null;
    try {
        response = await ctx.modalResponse(modal);
    } catch(e) {
        return; // it probably timed out
    }

    // extract responses from modal
    const serverName = response.fields.getTextInputValue("name");
    const serverIP   = response.fields.getTextInputValue("ip");

    // send an embed as a response
    const embed = new EmbedBuilder()
        .setTitle("Pinging...")
        .setDescription(`Pinging \`${serverIP}\`, please wait...`)
        .setColor("Yellow");
    await response.reply({ embeds: [embed] });

    let pingData: Data | null = null;
    try {
        // ping the minecraft server
        const [ip, port] = parseIpString(serverIP);
        pingData = await pingPromise(ip, port);
    } catch(e) {
        embed.setTitle("Failed to ping server")
            .setDescription(`The server at \`${serverIP}\` couldn't be reached!\n\nMake sure the server is online and publicly accessible.`)
            .setColor("Red");
        return await response.editReply({
            embeds: [embed]
        });
    }

    // parse the MOTD description
    let motd = "No description provided";
    if(pingData.description) {
        motd = format(convertTextComponent(pingData)).split("\n").map(s => s.trim()).join("\n");
    }

    // update embed
    embed.setTitle("Confirmation")
        .setDescription(`Please confirm you would like to add the server ${serverName}.\n\n**Description**\n\`\`\`\n${motd}\n\`\`\``)
        .addFields([
            { name: "Ping", value: `${pingData.ping}ms`, inline: true },
            { name: "Player Count", value: `${pingData.players.online} / ${pingData.players.max}`, inline: true }
        ]);

    // attach icon if it exists
    let iconAttachment: AttachmentBuilder | null = null;
    if(pingData.favicon) {
        const [iconName, icon] = attachEncodedImage(pingData.favicon);
        embed.setThumbnail(iconName);
        iconAttachment = icon;
    }

    // create button components
    const confirmId = "add_confirm";
    const confirmBtn = new ButtonBuilder({
        customId: confirmId,
        label: "Confirm",
        style: ButtonStyle.Success
    });
    const cancelId = "add_cancel";
    const cancelBtn = new ButtonBuilder({
        customId: cancelId,
        label: "Cancel",
        style: ButtonStyle.Danger
    });

    const buttonRow = new ActionRowBuilder<ButtonBuilder>({
        components: [ confirmBtn, cancelBtn ]
    });

    const msg = await response.editReply({
        embeds: [embed],
        files: iconAttachment ? [iconAttachment] : undefined,
        components: [buttonRow]
    });
    
    try {
        const btnPress = await getButtonPress(msg, [confirmId, cancelId], ctx.user);
        
        if(btnPress.customId === confirmId) {
            // confirmed, add the server
            if(await addServer(serverName, serverIP, guild, pingData.favicon)) {
                embed.setColor("Green")
                    .setTitle("Added!")
                    .setDescription(`The server ${serverName} has been added to your server list!`)
                    .addFields([
                        { name: "Address", value: serverIP, inline: true }
                    ]);
            } else {
                embed.setColor("Red")
                    .setTitle("Something went wrong")
                    .setDescription("Sorry, the server couldn't be added at the moment. Try again later.");
            }

            await btnPress.update({
                embeds: [embed],
                components: [] 
            });
        } else {
            // cancelled, show the rejected request
            embed.setColor("Red")
                .setTitle("Cancelled")
                .setDescription(`The server ${serverName} will not be added. Type \`/add\` to start again.`);
            await btnPress.update({
                embeds: [embed],
                components: []
            });
        }
    } catch(e) {
        // it probably timed out
        if(typeof e !== "undefined") {
            logger.error("Failed to collect button press!", e);
            embed.setDescription("Something went wrong handling the request. Please try again later.");
        } else {
            embed.setDescription("The request timed out. Please start a new request");
        }
        embed.setColor("Red");
        await response.editReply({
            embeds: [embed],
            components: []
        });
    }
};

export default AddCommand;
