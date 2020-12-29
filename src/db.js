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
            // todo: query database for servers
            return new Promise((resolve, reject) => {
                pool.query("SELECT name, ip FROM servers WHERE guild = ?", [ guildId ], (err, results) => {
                    if(err) reject(err);
                    resolve(results);
                });
            });
        }

    };

};