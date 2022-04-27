import { MessageEmbed } from "discord.js";
import { CommandContext } from "discord.js-slasher";

const Util = {

    sendPermissionError: async (ctx: CommandContext) => {
        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Permission needed")
            .setDescription("Sorry, you don't have permission to use this command.\nOnly Administrators can use this command.");
        await ctx.reply(embed, true);
    },

    attachEncodedImage: (image: string) => {
        const preamble = "";
    }

};

export default Util;