import { Config } from "./conf";
import mysql from "mysql";
import { GuildResolvable } from "discord.js";

export default function Database(config: Config) {

    const pool = mysql.createPool({
        user: config.database.user,
        password: config.database.pass,
        host: config.database.host,
        port: config.database.port,
        database: config.database.database
    });

    pool.on("error", (err: Error) => {
        console.error("Unexpected database error:", err);
    });

    return {

        getServers: (guildId: GuildResolvable) => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT name, ip FROM servers WHERE guild = ?", [ guildId ], (err, results) => {
                    if(err) reject(err);
                    resolve(results);
                });
            });
        },

        getServer: (guildId: GuildResolvable, idx: number) => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT name,ip,id FROM servers WHERE guild = ? LIMIT ?,1", [ guildId, idx ], (err, results) => {
                    if(err) reject(err);
                    if(!results || results.length < 1) reject("Could not find server at index " + idx);
                    resolve(results[0]);
                });
            });
        },

        getServerCount: (guildId: GuildResolvable) => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT COUNT(name) n FROM servers WHERE guild = ?", [ guildId ], (err, results) => {
                    if(err) reject(err);
                    if(!results || results.length < 1) reject("Could not get server count");
                    resolve(results[0].n);
                });
            });
        },

        newServer: (guildId: GuildResolvable, name: string, ip: string): Promise<string | void> => {
            return new Promise((resolve, reject) => {
                pool.query("INSERT INTO servers (guild, name, ip) VALUES (?,?,?)", [ guildId, name, ip ], (err, results) => {
                    if(err) reject(err);
                    if(!results || results.affectedRows < 1) reject("Could not insert");
                    resolve();
                });
            });
        },

        deleteServer: (guildId: GuildResolvable, id: string): Promise<string | void> => {
            return new Promise((resolve, reject) => {
                pool.query("DELETE FROM servers WHERE guild = ? AND id = ?", [ guildId, id ], (err, results) => {
                    if(err) reject(err);
                    if(!results || results.affectedRows < 1) reject("Could not delete");
                    resolve();
                });
            });
        }

    };

};