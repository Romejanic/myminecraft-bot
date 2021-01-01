const { MessageEmbed } = require("discord.js");
const Pinger = require("minecraft-pinger");
const ChatFormat = require("mc-chat-format");

const INVITE_LINK = "https://discord.com/api/oauth2/authorize?client_id=793150744533925888&permissions=52288&scope=bot";
const EMBED_COLOR = "#4e7a39";
const LOAD_COLOR  = "#ffff00";
const COMMAND_HELP = require("../command-help.json");
const db = require("./db");

const COMMANDS = {

    "mc?help": (args, channel) => {
        let embed = new MessageEmbed();
        embed.setTitle("Command Help");
        embed.setColor(EMBED_COLOR);
        if(args.length < 1) {
            embed.setDescription("Below is a list of commands.\n\nFor help with a specific command, type `mc?help [command name]`\n(e.g. `mc?help info` or `mc?help mc?status`).");
            for(let cmdName in COMMANDS) {
                embed.addField(cmdName, COMMAND_HELP[cmdName].message, false);
            }
        } else {
            let search = args[0].toLowerCase();
            if(!search.startsWith("mc?")) {
                search = "mc?" + search;
            }
            if(typeof COMMANDS[search] === "function") {
                let description = COMMAND_HELP[search].message + "\n\n**Usage**\n`" + search;
                if(COMMAND_HELP[search].args) {
                    let argsNames = Object.keys(COMMAND_HELP[search].args);
                    description += " " + argsNames.join(" ") + "`";
                    description += "\n\n`< >` indicates a required argument.\n`[ ]` indicates an optional argument.\n\n**Arguments**";

                    for(let arg of argsNames) {
                        embed.addField(arg, COMMAND_HELP[search].args[arg], false);
                    }
                } else {
                    description += "`";
                }
                embed.setTitle("Command Help for " + search);
                embed.setDescription(description);
            } else {
                embed.setColor("#ff0000");
                embed.setTitle("Command not found!");
                embed.setDescription("No command with the name `" + search + "` was found! Make sure it is spelled correctly.");
            }
        }
        channel.send(embed);
    },
    
    "mc?info": (args, channel) => {
        channel.send("info!");
    },

    "mc?list": async (args, channel, db) => {
        let embed = new MessageEmbed()
            .setTitle("Loading...")
            .setColor(LOAD_COLOR)
            .setDescription("Loading, please wait...");
        let msg = await channel.send(embed);
        let servers = await db.getServers(channel.guild.id);

        // populate embed with server data
        embed
            .setTitle("Server List")
            .setColor(EMBED_COLOR)
            .setDescription("For more information about a server, type `mc?status [server number]`.\n(e.g. `mc?status 2`)")
            .setFooter(servers.length + " / 5 server slots used");
        servers.forEach((val, i) => {
            embed.addField((i+1) + ". " + val.name, val.ip, true);
        });

        msg.edit(embed);
    },

    "mc?status": async (args, channel, db, imgServer) => {
        let embed = new MessageEmbed()
            .setTitle("Loading...")
            .setColor(LOAD_COLOR)
            .setDescription("Loading, please wait...");
        let msg = await channel.send(embed);

        let serverCount = await db.getServerCount(channel.guild.id);
        if(serverCount == 0) {
            embed
                .setTitle("No servers!")
                .setColor("#ff0000")
                .setDescription("You don't have any servers added yet. Please type `mc?add` to add a server.");
            msg.edit(embed);
            return;
        } else if(serverCount == 1) {
            args[0] = "1";
        }

        if(args.length < 1) {
            // get list of servers from database
            db.getServers(channel.guild.id).then((data) => {
                embed
                    .setTitle("Your Servers")
                    .setColor(EMBED_COLOR)
                    .setDescription("To view more info on a specific server, type `mc?status [server number]`.\n(e.g. `mc?status 2`)")
                    .setFooter(data.length + " / 5 server slots used");
                for(let i in data) {
                    let server = data[i];
                    let hrIdx = Number(i) + 1;
                    embed.addField(hrIdx + ". " + server.name, "Pinging...", true);
                    // ping the server
                    let { ip, port } = parseIpString(server.ip);
                    Pinger.pingPromise(ip,port).then((ping) => {
                        embed.fields[i].value = ":white_check_mark: " + ping.players.online + " / " + ping.players.max + " online";
                    }).catch(() => {
                        embed.fields[i].value = ":x: Offline";
                    }).finally(() => {
                        msg.edit(embed);
                    });
                }
                // update the message embed
                msg.edit(embed);
            }).catch((e) => {
                console.error("Failed to get server list!", e);
                embed
                    .setTitle("Error getting servers!")
                    .setColor("#ff0000")
                    .setDescription("Failed to load servers from database.\nPlease contact the developer if the error persists!");
                msg.edit(embed);
            });
        } else {
            let serverNo = args[0].trim();
            if(isNaN(serverNo) || serverNo < 1 || serverNo > serverCount) {
                embed
                    .setTitle("Invalid server number!")
                    .setColor("#ff0000")
                    .setDescription("Please enter a valid number between 1 and " + serverCount);
                msg.edit(embed);
                return;
            }
            // get server info from database
            let serverData = await db.getServer(channel.guild.id, Number(serverNo) - 1);
            // update embed
            embed
                .setTitle(Number(serverNo) + ". " + serverData.name)
                .addField("Server IP", serverData.ip, true)
                .setDescription("Pinging, please wait...");
            msg.edit(embed);
            // ping the server
            let { ip, port } = parseIpString(serverData.ip);
            Pinger.pingPromise(ip,port).then((ping) => {
                let playerText = "";
                if(ping.players.online > 0 && ping.players.sample && ping.players.sample.length > 0) {
                    playerText = "\n\n**Player Sample**\n";
                    playerText += ping.players.sample.map(s => s.name + "\n");
                }
                let motd = ChatFormat.format(ping.description).split("\n").map(s=>s.trim()).join("\n");
                playerText += "\n\n**Server Description**\n```" + motd + "```";
                embed
                    .setColor(EMBED_COLOR)
                    .setDescription(":white_check_mark: Online!" + playerText)
                    .addField("Player Count", `${ping.players.online} / ${ping.players.max}`, true)
                    .addField("Ping", `${ping.ping} ms`, true)
                    .addField("Version", ping.version.name);
                // get url for server icon
                imgServer.getUrlFor(ping.favicon).then((url) => {
                    embed.setThumbnail(url);
                    msg.edit(embed);
                }).catch(console.error);
            }).catch((e) => {
                // only print if it's actually an error
                let refused = true;
                if(e.code !== "ECONNREFUSED") {
                    console.error(e);
                    refused = false;
                }
                // update embed
                embed
                    .setColor("#ff0000")
                    .setDescription(":x: Could not reach server!\n\n " + (refused ? "The server is probably offline." : "An expected error may have occurred."));
            }).finally(() => {
                msg.edit(embed);
            });
        }
    }

};

function sendCommandError(channel, cmdName) {
    let embed = new MessageEmbed()
        .setTitle("Command not found!")
        .setColor("#ff0000")
        .setDescription("Sorry, `" + cmdName + "` is not a valid command!\nType `mc?help` for a list of commands.");
    channel.send(embed);
}

function parseIpString(ip) {
    let port = 25565;
    if(ip.indexOf(":") > -1) {
        let portStr = ip.substring(ip.indexOf(":")+1);
        if(!isNaN(portStr)) {
            port = Number(portStr);
        }
        ip = ip.substring(0, ip.indexOf(":"));
    }
    return { ip, port };
}

module.exports = {

    parse: async (text, msg, db, imgServer) => {
        // parse arguments and command name
        let args = text.split(" ");
        let cmd = args[0].toLowerCase();
        args = args.splice(1);
        // attempt to execute the command
        if(typeof COMMANDS[cmd] === "function") {
            await COMMANDS[cmd](args, msg.channel, db, imgServer);
        } else {
            sendCommandError(msg.channel, cmd);
        }
    },

    matchPrefix: (text) => {
        return text.startsWith("mc?");
    },

    isChannelValid: (channel) => {
        return channel.type === "text";
    },

    sendDmError: (channel) => {
        let embed = new MessageEmbed()
            .setTitle("Sorry!")
            .setColor("#ff0000")
            .setDescription(`Sorry, this bot cannot be used from DMs!\nYou must invite it to a server first.\n\n[Click here to invite me!](${INVITE_LINK})`);
        channel.send(embed);
    },

    sendError: (channel, errorMessage) => {
        let embed = new MessageEmbed()
            .setTitle("Error")
            .setColor("#ff0000")
            .setDescription(errorMessage)
            .setFooter("If this error persists, please contact the developer!");
        channel.send(embed);
    }

};