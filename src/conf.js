const fs = require("fs");
const CONFIG_PATH = "config.json";

function defaultConfig() {
    return JSON.stringify({
        discord: {
            _comment: "Enter your bot token from your Discord developer application.",
            token: "ENTER-YOUR-TOKEN-HERE"
        },
        database: {
            _comment: "Enter your database login credentials. You should have the appropriate database set up already.",
            user: "ENTER-YOUR-USERNAME",
            pass: "ENTER-YOUR-PASSWORD",
            host: "localhost",
            port: 3306,
            database: "myminecraft"
        }
    }, null, 4);
}

function checkIntegrity(config) {
    if(typeof config !== "object" || !config.discord || !config.database)
        return false;
    let discordExp = ["token"];
    let databaseExp = ["user","pass","host","port","database"];
    let discordKeys = Object.keys(config.discord).sort();
    let databaseKeys = Object.keys(config.database).sort();
    return discordExp.every(v => discordKeys.includes(v))
        && databaseExp.every(v => databaseKeys.includes(v));
}

module.exports = {

    getConfig: (cb) => {
        if(!fs.existsSync(CONFIG_PATH)) {
            // generate a default config file
            fs.writeFileSync(CONFIG_PATH, defaultConfig());
            // tell the user and exit
            console.error("[Config] There is no config file, one has been created.");
            console.error("[Config] Please edit config.json and add your bot token and database login.");
            process.exit(0);
        } else {
            const config = require("../config.json");
            // check if the config file is valid
            if(!checkIntegrity(config)) {
                // rename the current config and generate a new one
                fs.renameSync(CONFIG_PATH, CONFIG_PATH + ".old");
                fs.writeFileSync(CONFIG_PATH, defaultConfig());
                // tell the user and exit
                console.error("[Config] Your config file was incorrect, a new one has been generated.");
                console.error("[Config] Please edit config.json and add your bot token and database login.");
                process.exit(0);
            } else {
                cb(config);
            }
        }
    }

};