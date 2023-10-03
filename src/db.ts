import { Guild } from "discord.js";
import { PrismaClient } from "@prisma/client";
import createLogger from "logger";

const prisma = new PrismaClient();
const logger = createLogger("DB");

export async function addServer(name: string, ip: string, guild: Guild) {
    try {
        await prisma.servers.create({
            data: {
                name, ip, guild: guild.id
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
