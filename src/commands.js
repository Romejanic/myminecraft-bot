const { MessageEmbed } = require("discord.js");
const Pinger = require("minecraft-pinger");
const ChatFormat = require("mc-chat-format");
const Wizard = require("./wizard");

const INVITE_LINK = "https://discord.com/api/oauth2/authorize?client_id=793150744533925888&permissions=52288&scope=bot";
const EMBED_COLOR = "#4e7a39";
const LOAD_COLOR  = "#ffff00";
const COMMAND_HELP = require("../command-help.json");
const conf = require("./conf");

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
                    playerText += ping.players.sample.map(s=>s.name).join("\n");
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
    },

    "mc?add": async (args, channel, db, imgServer, wizardOps) => {
        let serverCount = await db.getServerCount(channel.guild.id);
        if(serverCount >= 5) {
            let embed = new MessageEmbed()
                .setTitle("Too many servers!")
                .setColor("#ff0000")
                .setDescription("You cannot add any more servers because you've reached your 5 server limit!\n\nPlease delete a server with `mc?remove` before adding another one.");
            await channel.send(embed);
            return;
        }

        Wizard.createWizard([
            // step 1
            async (msg, state) => {
                if(state.init) {
                    // initialise wizard
                    state.embed = new MessageEmbed()
                        .setTitle("1) Enter name")
                        .setColor(EMBED_COLOR)
                        .setDescription("Please enter a name for your server (max 30 characters)!")
                        .setFooter("This action will be cancelled if ignored for 1 minute.");
                    let m = await channel.send(state.embed);
                    state.update = async () => {
                        m.edit(state.embed);
                    };
                } else {
                    // validate input
                    let nameIn = msg.content.trim();
                    if(nameIn.length <= 0 || nameIn.length > 30) {
                        state.embed.setColor("#ff0000")
                                    .setDescription("Please enter a valid name for the server! (max 30 characters)");
                        await state.update();
                        return false;
                    } else {
                        state.name = nameIn;
                        state.embed.setColor(EMBED_COLOR)
                                    .setTitle("2) Enter IP")
                                    .setDescription(
                                        "Enter your server's IP address (and optionally port).\n\n" +
                                        "Examples:\n```\n" +
                                        "mc.hypixel.net\n" +
                                        "us.mineplex.com\n" +
                                        "play.example.com:45000\n" +
                                        "```\n\n**NOTE:** Your server must be publicly available (i.e. not on your local network)."
                                    );
                        await state.update();
                        return true;
                    }
                }
            },
            // step 2 (and 3)
            async (msg, state, cancel) => {
                let ipIn = msg.content.trim();
                if(ipIn.length <= 0 || ipIn.length > 255) {
                    state.embed.setColor("#ff0000")
                                .setDescription("The entered IP is invalid! Please enter a IP address between 0 and 255 characters long!");
                    await state.update();
                    return false;
                }
                state.address = ipIn;
                // ping server
                state.embed.setColor("#ffff00")
                            .setTitle("3) Validating...")
                            .setDescription("Your server is now being pinged in order to validate it. Please wait...\n\nYour server must be online for this step.");
                await state.update();

                try {
                    let { ip, port } = parseIpString(state.address);
                    let data = await Pinger.pingPromise(ip, port);

                    let motd = ChatFormat.format(data.description).split("\n").map(s=>s.trim()).join("\n");
                    let thumb = await imgServer.getUrlFor(data.favicon);

                    state.details = "\n\n**Chosen Name**\n" + state.name + "\n\n**Description**\n```" + motd + "```";
                    state.embed.setColor(EMBED_COLOR)
                                .setTitle("4) Confirmation")
                                .setDescription("Please confirm that this is your server by responding with 'yes' or 'no'." + state.details)
                                .addField("Player Count", data.players.online + " / " + data.players.max, true)
                                .addField("Version", data.version.name, true)
                                .setThumbnail(thumb);
                    await state.update();
                    return true;
                } catch(e) {
                    cancel();
                    state.embed.setColor("#ff0000")
                                .setTitle("Cannot validate!")
                                .setDescription("Sorry, your server could not be validated!\nPlease ensure it is online and publicly accesible.")
                                .setFooter("Please run `mc?add` again to restart the process.");
                    await state.update();
                }
            },
            // step 4
            async (msg, state, cancel) => {
                let confirmIn = msg.content.trim().toLowerCase();
                let yesIn = confirmIn.startsWith("y");
                let noIn = confirmIn.startsWith("n");
                if(!yesIn && !noIn) {
                    state.embed.setColor("#ff0000")
                                .setDescription("Please enter **either** 'yes' or 'no' to confirm." + state.details);
                    await state.update();
                    return false;
                } else if(yesIn) {
                    state.embed.setColor("#ffff00")
                                .setTitle("Saving...")
                                .setDescription("Please wait while your server information is saved.")
                                .setFooter("");
                    state.embed.fields = [];
                    await state.update();
                    // commit info to database
                    try {
                        await db.newServer(msg.guild, state.name, state.address);
                        serverCount++;
                        state.embed.setColor("#00ff00")
                                    .setTitle("Saved!")
                                    .setDescription(state.name + " has been added to your server list!")
                                    .addField("Server Number", String(serverCount))
                                    .setFooter("Type `mc?status " + serverCount + "` to view this server");
                        await state.update();
                        return true;
                    } catch(e) {
                        console.error(e);
                        state.embed.setColor("#ff0000")
                                    .setTitle("Error")
                                    .setDescription("An unexpected error occurred while saving your server! Please try again later.")
                                    .setFooter("If the issue persists, please submit a bug report!");
                        await state.update();
                    }

                } else if(noIn) {
                    cancel();
                    state.embed.setTitle("Cancelled")
                        .setDescription("Your server addition was cancelled.")
                        .setFooter("")
                        .setThumbnail("")
                        .setColor("#ff0000");
                    state.embed.fields = [];
                    await state.update();
                }
            }
        ], wizardOps.msg, wizardOps.client);
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

    parse: async (text, msg, db, imgServer, wizardOps) => {
        // parse arguments and command name
        let args = text.split(" ");
        let cmd = args[0].toLowerCase();
        args = args.splice(1);
        // attempt to execute the command
        if(typeof COMMANDS[cmd] === "function") {
            await COMMANDS[cmd](args, msg.channel, db, imgServer, wizardOps);
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