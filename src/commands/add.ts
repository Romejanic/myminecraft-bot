import Modal from "../modal/Modal";
import TextInput, { TextInputStyle } from "../modal/TextInput";
import { Command } from "./manager";

const AddCommand: Command = async (ctx) => {
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
    } else {
        await ctx.command.followUp("You didn't respond");
    }
};

export default AddCommand;