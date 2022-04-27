import { Config } from "./conf";
import mysql, { OkPacket, RowDataPacket } from "mysql2";
import { GuildResolvable } from "discord.js";

export interface ServerInfo {
    name: string;
    ip: string;
    id?: string;
};

export interface Database {
    getServers: (guildId: GuildResolvable) => Promise<ServerInfo[]>;
    getServer: (guildId: GuildResolvable) => Promise<ServerInfo>;
    getServerCount: (guildId: GuildResolvable) => Promise<number>;
    newServer: (guildId: GuildResolvable, name: string, ip: string) => Promise<void>;
    deleteServer: (guildId: GuildResolvable, id: string) => Promise<void>;
};

export default function initDatabase(config: Config) {

    const pool = mysql.createPool({
        user: config.database.user,
        password: config.database.pass,
        host: config.database.host,
        port: config.database.port,
        database: config.database.database
    });

    return {

        getServers: (guildId: GuildResolvable): Promise<ServerInfo[]> => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT name, ip FROM servers WHERE guild = ?", [ guildId ], (err, results) => {
                    if(err) reject(err);
                    const rows = results as RowDataPacket[];
                    resolve(rows.map(row => {
                        return {
                            name: row["name"],
                            ip: row["ip"]
                        };
                    }));
                });
            });
        },
        

        getServer: (guildId: GuildResolvable, idx: number): Promise<ServerInfo> => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT name,ip,id FROM servers WHERE guild = ? LIMIT ?,1", [ guildId, idx ], (err, results) => {
                    if(err) reject(err);
                    if(!results || (results as RowDataPacket[]).length < 1) reject("Could not find server at index " + idx);
                    resolve(results[0] as ServerInfo);
                });
            });
        },

        getServerCount: (guildId: GuildResolvable): Promise<number> => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT COUNT(name) n FROM servers WHERE guild = ?", [ guildId ], (err, results) => {
                    if(err) reject(err);
                    const rows = results as RowDataPacket[];
                    if(!results || rows.length < 1) reject("Could not get server count");
                    resolve(rows[0]["n"] as number);
                });
            });
        },

        newServer: (guildId: GuildResolvable, name: string, ip: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                pool.query("INSERT INTO servers (guild, name, ip) VALUES (?,?,?)", [ guildId, name, ip ], (err, results) => {
                    if(err) reject(err);
                    if(!results || (results as OkPacket).affectedRows < 1) reject("Could not insert");
                    resolve();
                });
            });
        },

        deleteServer: (guildId: GuildResolvable, id: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                pool.query("DELETE FROM servers WHERE guild = ? AND id = ?", [ guildId, id ], (err, results) => {
                    if(err) reject(err);
                    if(!results || (results as OkPacket).affectedRows < 1) reject("Could not delete");
                    resolve();
                });
            });
        }

    } as Database;

};