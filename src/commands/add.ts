import { CommandExecutor } from "cmds";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { pingPromise, Data } from "minecraft-pinger";
import { Component, format } from 'mc-chat-format';
import { attachEncodedImage, parseIpString } from "../util";

const AddCommand: CommandExecutor = async (ctx) => {
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
    const response = await ctx.modalResponse(modal);

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
        .setDescription(`Please confirm you would like to add the server ${serverName}.\n\n**Description**\n\`\`\`\n${motd}\n\`\`\``);

    // attach icon if it exists
    let iconAttachment: AttachmentBuilder | null = null;
    if(pingData.favicon) {
        const [iconName, icon] = attachEncodedImage(pingData.favicon);
        embed.setThumbnail(iconName);
        iconAttachment = icon;
    }

    // create button components
    const confirmBtn = new ButtonBuilder({
        customId: "add_confirm",
        label: "Confirm",
        style: ButtonStyle.Success
    });
    const cancelBtn = new ButtonBuilder({
        customId: "add_cancel",
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
};

function convertTextComponent(pingData: Data): Component {
    // in this case it's just easier to ignore types
    const comp = pingData.description as any;
    return comp as Component;
}

export default AddCommand;
