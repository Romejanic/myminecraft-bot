import { MessageAttachment, MessageEmbed } from "discord.js";
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
        const preamble = "data:image/png;base64,";
        if(image.startsWith(preamble)) {
            image = image.substring(preamble.length);
        }
        const buffer = Buffer.from(image, 'base64');
        return new MessageAttachment(buffer, "favicon.png");
    }

};

export default Util;