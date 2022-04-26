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
    await modal.show();
};

export default AddCommand;