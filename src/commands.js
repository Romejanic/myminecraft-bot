const { MessageEmbed } = require("discord.js");
const INVITE_LINK = "https://discord.com/api/oauth2/authorize?client_id=793150744533925888&permissions=52288&scope=bot";

const COMMANDS = {

    "mc?help": (args, channel) => {
        channel.send("help!");
    },
    
    "mc?info": (args, channel) => {
        channel.send("info!");
    }

};

function sendCommandError(channel, cmdName) {
    let embed = new MessageEmbed()
        .setTitle("Command not found!")
        .setColor("#ff0000")
        .setDescription(`Sorry, ${cmdName} is not a valid command!\n` + "Type `mc?help` for a list of commands.");
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