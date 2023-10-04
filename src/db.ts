import { Guild } from "discord.js";
import { PrismaClient, servers } from "@prisma/client";
import createLogger from "logger";
import { hashServerIcon } from "./util";

const prisma = new PrismaClient();
const logger = createLogger("DB");

export type Server = servers;

export async function addServer(name: string, ip: string, guild: Guild, icon?: string) {
    try {
        await prisma.servers.create({
            data: {
                name, ip, guild: guild.id,
                icon_cache: icon,
                icon_hash: icon ? hashServerIcon(icon) : undefined
            }
        });
        return true;
    } catch(e) {
        logger.error("Failed to add new server!", e);
        return false;
    }
}

export async function listServers(guild: Guild) {
    return await prisma.servers.findMany({
        where: {
            guild: guild.id
        }
    });
}

export async function countServers(guild: Guild) {
    return await prisma.servers.count({
        where: {
            guild: guild.id
        }
    });
}

export async function setCachedIcon(server: Server, icon: string) {
    const hash = hashServerIcon(icon);
    return await prisma.servers.update({
        data: {
            icon_cache: icon,
            icon_hash: hash
        },
        where: {
            id: server.id
        }
    });
}
