import { EmbedImage, ServerAddress } from "const";
import { AttachmentBuilder, ButtonBuilder, Message } from "discord.js";

export function parseIpString(ip: string): ServerAddress {
    let port = 25565;
    if(ip.indexOf(":") > -1) {
        let parsedPort = Number(ip.substring(ip.indexOf(":")+1));
        if(!isNaN(parsedPort)) {
            port = parsedPort;
        }
        ip = ip.substring(0, ip.indexOf(":"));
    }
    return [ ip, port ];
}

export function attachEncodedImage(image: string): EmbedImage {
    const preamble = "data:image/png;base64,";
    if(image.startsWith(preamble)) {
        image = image.substring(preamble.length);
    }
    const buffer = Buffer.from(image, 'base64');
    const name   = "server-icon.png";
    return ["attachment://" + name, new AttachmentBuilder(buffer, { name })];
}
