import { MessageAttachment, MessageEmbed } from "discord.js";
import { CommandContext } from "discord.js-slasher";
import { EmbedImage } from "../const";

const Util = {

    sendPermissionError: async (ctx: CommandContext) => {
        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("Permission needed")
            .setDescription("Sorry, you don't have permission to use this command.\nOnly Administrators can use this command.");
        await ctx.reply(embed, true);
    },

    attachEncodedImage: (image: string): EmbedImage => {
        const preamble = "data:image/png;base64,";
        if(image.startsWith(preamble)) {
            image = image.substring(preamble.length);
        }
        const buffer = Buffer.from(image, 'base64');
        const name   = "server-icon.png";
        return ["attachment://" + name, new MessageAttachment(buffer, name)];
    }

};

export default Util;