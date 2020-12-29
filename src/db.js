const mysql = require("mysql");

module.exports = function(config) {

    const pool = mysql.createPool({
        user: config.database.user,
        password: config.database.pass,
        host: config.database.host,
        port: config.database.port,
        database: config.database.database
    });

    pool.on("error", (err) => {
        console.error("Unexpected database error:", err);
    });

    return {

        getServers: (guildId) => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT name, ip FROM servers WHERE guild = ?", [ guildId ], (err, results) => {
                    if(err) reject(err);
                    resolve(results);
                });
            });
        },

        getServer: (guildId, idx) => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT name,ip FROM servers WHERE guild = ? LIMIT ?,1", [ guildId, idx ], (err, results) => {
                    if(err) reject(err);
                    if(!results || results.length < 1) reject("Could not find server at index " + idx);
                    resolve(results[0]);
                });
            });
        },

        getServerCount: (guildId) => {
            return new Promise((resolve, reject) => {
                pool.query("SELECT COUNT(name) n FROM servers WHERE guild = ?", [ guildId ], (err, results) => {
                    if(err) reject(err);
                    if(!results || results.length < 1) reject("Could not get server count");
                    resolve(results[0].n);
                });
            });
        }

    };

};