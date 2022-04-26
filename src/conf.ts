import fs from "fs";
const CONFIG_PATH = "config.json";

export interface Config {
    database: {
        _comment?: string;
        user: string;
        pass: string;
        host: string;
        port: number;
        database: string;
    },
    imageServer: {
        _comment?: string;
        host: string;
        secret: string;
    }
};

function defaultConfig() {
    return JSON.stringify({
        database: {
            _comment: "Enter your database login credentials. You should have the appropriate database set up already.",
            user: "ENTER-YOUR-USERNAME",
            pass: "ENTER-YOUR-PASSWORD",
            host: "localhost",
            port: 3306,
            database: "myminecraft"
        },
        imageServer: {
            _comment: "Enter the domain name and secret of your image server (e.g. 'mytestserver.com')",
            host: "ENTER-YOUR-HOST-ADDRESS",
            secret: "ENTER-YOUR-SECRET-HERE"
        }
    }, null, 4);
}

function checkIntegrity(config: Config) {
    if(typeof config !== "object" || !config.database || !config.imageServer)
        return false;
    let databaseExp = ["user","pass","host","port","database"];
    let imgServerExp = ["host","secret"];
    let databaseKeys = Object.keys(config.database).sort();
    let imgServerKeys = Object.keys(config.imageServer).sort();
    return databaseExp.every(v => databaseKeys.includes(v))
        && imgServerExp.every(v => imgServerKeys.includes(v));
}

type ConfigCallback = (config: Config) => void;

const ConfigExport = {

    getConfig: (cb: ConfigCallback) => {
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

export default ConfigExport;