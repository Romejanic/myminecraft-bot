import { EmbedImage, ServerAddress } from "const";
import { AttachmentBuilder, ButtonInteraction, ComponentType, EmbedBuilder, Message, User } from "discord.js";
import { Component } from "mc-chat-format";
import { Data } from "minecraft-pinger";

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

export function getButtonPress(msg: Message, buttonIds: string[], user: User): Promise<ButtonInteraction> {
    return new Promise((resolve, reject) => {
        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: i => buttonIds.some(id => i.customId === id),
            time: 10 * 60 * 1000
        });
        collector.on("collect", async i => {
            if(i.user.id !== user.id) {
                const embed = new EmbedBuilder()
                    .setTitle("Not allowed")
                    .setDescription("This dialog was created by another user")
                    .setColor("Red");
                await i.reply({
                    embeds: [embed] 
                });
                return;
            }
            collector.stop();
            resolve(i);
        });
        collector.on("end", collected => {
            if(collected.size < 1) {
                reject();
            }
        });
    });
}

export function convertTextComponent(pingData: Data): Component {
    // in this case it's just easier to ignore types
    const comp = pingData.description as any;
    return comp as Component;
}
