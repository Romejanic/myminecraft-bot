import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import Pinger from 'minecraft-pinger';
import { format, Component } from 'mc-chat-format';
import { Command } from "./manager";
import Util from "./util";
import { Modal, TextInputComponent, showModal } from "discord-modals";
import createModalSubmitCollector from "../modal/modalCollector";
import { SUPPORT_SERVER } from "../const";

const AddCommand: Command = async (ctx, db) => {
    // check the user has permission to do this
    if(!ctx.server.isUserAdmin) return Util.sendPermissionError(ctx);

    // check how many server slots are left
    const serverCount = await db.getServerCount(ctx.server.id);
    if(serverCount >= 5) {
        const embed = new MessageEmbed()
            .setTitle("Too many servers!")
            .setColor("#ff0000")
            .setDescription("You cannot add any more servers because you've reached your 5 server limit!\n\nPlease delete a server with `/remove` before adding another one.");
        return await ctx.reply(embed, true);
    }

    // open modal to enter name and IP address
    const modal = new Modal()
        .setTitle("Add server")
        .setCustomId("mymc_add_server")
        .addComponents(
        new TextInputComponent()
            .setLabel("Server Name")
            .setPlaceholder("e.g. Hypixel")
            .setCustomId("mymc_server_name")
            .setStyle("SHORT")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(30),
        new TextInputComponent()
            .setLabel("Server IP")
            .setPlaceholder("e.g. hypixel.net")
            .setCustomId("mymc_server_ip")
            .setStyle("SHORT")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(255));

    // show modal and make a collector to wait for responses
    showModal(modal, { client: ctx.client, interaction: ctx.command });
    const collector = createModalSubmitCollector(ctx, modal);
    
    // on the modal submission
    collector.on("submit", async (i) => {
        const embed = new MessageEmbed()
            .setColor("YELLOW")
            .setTitle("Pinging...")
            .setDescription("Pinging your Minecraft server now, please wait...");

        await i.reply({
            embeds: [embed],
            ephemeral: true
        });
        const msg = await i.fetchReply();

        // try to ping the server
        try {
            const name         = i.getTextInputValue("mymc_server_name");
            const [ ip, port ] = Util.parseIpString(i.getTextInputValue("mymc_server_ip"));
            const pingData     = await Pinger.pingPromise(ip, port);

            // get the server's MOTD
            let motd = "No description provided";
            if(pingData.description) {
                motd = format(convertTextComponent(pingData)).split("\n").map(s => s.trim()).join("\n");
            }

            // get icon and create embed
            const [iconName, icon] = Util.attachEncodedImage(pingData.favicon);
            embed
                .setTitle("Confirmation")
                .setDescription("Please confirm that you would like to add this server\n\n**Description**\n```" + motd + "```")
                .addField("Chosen Name", name)
                .setThumbnail(iconName);

            // create confirm buttons
            const confirmBtn = new MessageButton({
                customId: "mymc_add_confirm",
                label: "Confirm",
                style: "SUCCESS"
            });
            const cancelBtn = new MessageButton({
                customId: "mymc_add_cancel",
                label: "Cancel",
                style: "DANGER"
            });

            const buttons = new MessageActionRow({
                components: [confirmBtn, cancelBtn]
            });

            // edit message and show confirmation
            await msg.edit({
                embeds: [embed],
                files: [icon],
                components: [buttons]
            });

            // listen for button presses
            const buttonCollector = msg.createMessageComponentCollector({
                filter: i => buttons.components.some(b => b.customId === i.customId),
                time: 10 * 60 * 1000 // 10 minutes
            });

            buttonCollector.on("collect", async i => {
                // only allow the requesting user to respond
                if(i.user.id !== ctx.user.id) {
                    const embed = new MessageEmbed()
                        .setColor("RED")
                        .setTitle("Not your request")
                        .setDescription("You did not make this request!");
                    return await i.reply({
                        embeds: [embed],
                        ephemeral: true
                    });
                }

                if(i.customId === confirmBtn.customId) {
                    try {
                        await db.newServer(ctx.server.id, name, `${ip}:${port}`);
                        
                        // send confirmation message
                        embed.setColor("GREEN")
                            .setTitle("Success")
                            .setDescription(`${name} has been added to your saved server list.`)
                            .setFields([]);
                        await i.update({
                            embeds: [embed],
                            files: [icon],
                            components: []
                        });
                    } catch(e) {
                        console.error("[/add] Failed to add server:", e);
                        // send error message
                        embed.setColor("RED")
                            .setTitle("Error")
                            .setDescription(`An unexpected error ocurred while adding ${name} to your server list.\n\nPlease [contact support](${SUPPORT_SERVER}) if the error persists.`)
                            .setFields([]);
                        await i.update({
                            embeds: [embed],
                            files: [icon],
                            components: []
                        });
                    }
                }

                else if(i.customId === cancelBtn.customId) {
                    // send cancellation message
                    embed.setColor("RED")
                    .setTitle("Cancelled")
                    .setDescription(`You did not add ${name} to your server list.\n\nType \`/add\` again if you'd like to restart.`)
                    .setFields([]);
                    await i.update({
                        embeds: [embed],
                        files: [icon],
                        components: []
                    });
                }

                buttonCollector.stop("done");
            });

            buttonCollector.on("end", async (_, reason) => {
                if(reason !== "done") {
                    // send timeout message
                    embed.setColor("RED")
                    .setTitle("Expired")
                    .setDescription(`You did not respond in time, so the request has expired.\n\nType \`/add\` again if you'd like to restart.`)
                    .setFields([]);
                    await msg.edit({
                        embeds: [embed],
                        files: [icon],
                        components: []
                    });
                }
            });
        } catch(e) {
            // ping failed, tell the user
            const embed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Cannot validate!")
                .setDescription("The server could not be pinged.\nPlease ensure it is online and publicly accessible.\n\n**NOTE:** The server cannot be on your local network.");
            await msg.edit({
                embeds: [embed]
            });
        }
    });
};

function convertTextComponent(pingData: Pinger.Data): Component {
    // in this case it's just easier to ignore types
    const comp = pingData.description as any;
    return comp as Component;
}

export default AddCommand;