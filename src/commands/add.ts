import { Message, MessageEmbed } from "discord.js";
import Pinger, { ping } from 'minecraft-pinger';
import ChatFormat from 'mc-chat-format';
import Modal from "../modal/Modal";
import TextInput, { TextInputStyle } from "../modal/TextInput";
import { Command } from "./manager";
import Util from "./util";

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
    const modal = new Modal(ctx)
        .setTitle("Add server")
        .setCustomID("mymc_add_server")
        .addRows([new TextInput()
            .setLabel("Server Name")
            .setPlaceholder("e.g. Hypixel")
            .setCustomID("mymc_server_name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(30)])
        .addRows([new TextInput()
            .setLabel("Server IP")
            .setPlaceholder("e.g. hypixel.net")
            .setCustomID("mymc_server_ip")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(255)]);
    const result = await modal.showAndWait();

    if(result.submitted) {
        const embed = new MessageEmbed()
            .setColor("YELLOW")
            .setTitle("Pinging...")
            .setDescription("Pinging your Minecraft server now, please wait...");
        const msg = await ctx.command.followUp({
            embeds: [embed],
            ephemeral: true
        }) as Message;
        
        // try to ping the server
        try {
            const name         = result.values["mymc_server_name"];
            const { ip, port } = parseIpString(result.values["mymc_server_ip"]);
            const pingData     = await Pinger.pingPromise(ip, port);

            // get the server's MOTD
            let motd = "No description provided";
            if(pingData.description) {
                motd = ChatFormat.format(convertTextComponent(pingData)).split("\n").map(s => s.trim()).join("\n");
            }

            console.log(pingData.favicon);
            embed
                .setTitle("Confirmation")
                .setDescription("Please confirm that you would like to add this server\n\n**Description**\n```" + motd + "```")
                .addField("Chosen Name", name);
            await msg.edit({
                embeds: [embed]
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
    }
};

function parseIpString(ip: string) {
    let port = 25565;
    if(ip.indexOf(":") > -1) {
        let parsedPort = Number(ip.substring(ip.indexOf(":")+1));
        if(!isNaN(parsedPort)) {
            port = parsedPort;
        }
        ip = ip.substring(0, ip.indexOf(":"));
    }
    return { ip, port };
}

function convertTextComponent(pingData: Pinger.Data): ChatFormat.Component {
    // jesus christ typescript
    return {
        text: pingData.description.text,
        extra: pingData.description.extra ? [{
            text: pingData.description.extra.text,
            color: pingData.description.extra.color,
            bold: pingData.description.extra.bold,
            strikethrough: pingData.description.extra.strikethrough,
            extra: pingData.description.extra.extra ? [{
                color: pingData.description.extra.extra.color,
                text: pingData.description.extra.extra.text
            }] : []
        }] : []
    };
}

export default AddCommand;