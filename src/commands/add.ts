import { MessageEmbed } from "discord.js";
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
            .setDescription("You cannot add any more servers because you've reached your 5 server limit!\n\nPlease delete a server with `mc?remove` before adding another one.");
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
            .setRequired(true)])
        .addRows([new TextInput()
            .setLabel("Server IP")
            .setPlaceholder("e.g. hypixel.net")
            .setCustomID("mymc_server_ip")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)]);
    const result = await modal.showAndWait();

    if(result.submitted) {
        await ctx.command.followUp(`Server name: ${result.values["mymc_server_name"]}\nServer IP: ${result.values["mymc_server_ip"]}`);
    }
};

export default AddCommand;