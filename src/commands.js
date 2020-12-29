const { MessageEmbed, MessageAttachment } = require("discord.js");

const INVITE_LINK = "https://discord.com/api/oauth2/authorize?client_id=793150744533925888&permissions=52288&scope=bot";
const EMBED_COLOR = "#4e7a39";
const COMMAND_HELP = require("../command-help.json");

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

    "mc?status": (args, channel) => {

    }

};

function sendCommandError(channel, cmdName) {
    let embed = new MessageEmbed()
        .setTitle("Command not found!")
        .setColor("#ff0000")
        .setDescription("Sorry, `" + cmdName + "` is not a valid command!\nType `mc?help` for a list of commands.");
    channel.send(embed);
}

module.exports = {

    parse: async (text, msg) => {
        // parse arguments and command name
        let args = text.split(" ");
        let cmd = args[0].toLowerCase();
        args = args.splice(1);
        // attempt to execute the command
        if(typeof COMMANDS[cmd] === "function") {
            await COMMANDS[cmd](args, msg.channel);
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