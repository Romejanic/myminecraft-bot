import { MessageAttachment, MessageEmbed, MessageSelectOptionData } from "discord.js";
import { CommandContext } from "discord.js-slasher";
import { EmbedImage, ServerAddress } from "../const";
import { ServerInfo } from "../db";

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
    },

    parseIpString: (ip: string): ServerAddress => {
        let port = 25565;
        if(ip.indexOf(":") > -1) {
            let parsedPort = Number(ip.substring(ip.indexOf(":")+1));
            if(!isNaN(parsedPort)) {
                port = parsedPort;
            }
            ip = ip.substring(0, ip.indexOf(":"));
        }
        return [ ip, port ];
    },

    serversToDropdown: (servers: ServerInfo[]): MessageSelectOptionData[] => {
        return servers.map((server, idx) => {
            return {
                label: server.name,
                description: server.ip,
                value: String(idx)
            };
        });
    }

};

export default Util;