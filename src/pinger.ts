import { Server, setCachedIcon } from "db";
import { Data, pingPromise } from "minecraft-pinger";
import { parseIpString, hashServerIcon } from "./util";
import createLogger from "logger";

const logger = createLogger("Ping");

export type PingStatus = "pending" | "success" | "failure";

export interface PendingData {
    state: PingStatus;
    data?: Data;
}

export default function pingServers(servers: Server[], onUpdate: () => unknown) {
    const statusObj: Record<number, PendingData> = {};
    for(let server of servers) {
        statusObj[server.id] = { state: "pending" };
        const [ip, port] = parseIpString(server.ip);
        pingPromise(ip, port)
            .then(data => {
                statusObj[server.id] = { state: "success", data };

                // update cached icon if needed
                if(data.favicon) {
                    const iconHash = hashServerIcon(data.favicon);
                    if(iconHash !== server.icon_hash) {
                        setCachedIcon(server, data.favicon)
                            .then(() => logger.debug(`Updated cached icon for ${server.name} (id ${server.id})`))
                            .catch(e => logger.warn("Failed to update cached server icon!", e));
                    }
                } else if(server.icon_cache) {
                    // fallback on cached icon if the ping doesn't find one
                    data.favicon = server.icon_cache;
                }
            })
            .catch(_ => statusObj[server.id] = { state: "failure" })
            .finally(onUpdate);
    }
    return statusObj;
}

export function statusIcon(status: PingStatus) {
    switch(status) {
        case "success": return "✅";
        case "failure": return "❌";
        case "pending": return "⏳";
        default: return "?";
    }
}
