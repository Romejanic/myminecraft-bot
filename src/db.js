const mysql = require("mysql");

module.exports = function(config) {

    // todo: create pool connection

    return {

        getServers: (guildId) => {
            // todo: query database for servers
            return Promise.resolve().then(() => {
                return [
                {
                    name: "My Server",
                    ip: "myserver.example.com:42000",
                    online: "2 / 10",
                    motd: "Play now! It's fun on here.",
                    players: [ "Example", "ChrisyBoy2" ]
                },
                {
                    name: "Hypixel",
                    ip: "hypixel.net",
                    online: false
                }
                ]
            });
        }

    };

};