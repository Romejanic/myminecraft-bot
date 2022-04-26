import { MessageEmbed } from "discord.js";
import { CommandContext } from "discord.js-slasher";

// command handlers
import InfoCommand from "./info";
import ListCommand from "./list";

const CommandManagerImpl: CommandManager = {
    commands: {
        "info": InfoCommand,
        "list": ListCommand
    },
    
    run: async (ctx) => {
        const { commands } = CommandManagerImpl;
        if(commands[ctx.name]) {
            try {
                // run the requested command
                await commands[ctx.name](ctx);
            } catch(e) {
                console.error("[Command] Error running command:", e);
                // show user an error message
                const embed = new MessageEmbed()
                    .setColor("RED")
                    .setTitle("Error while running command")
                    .setDescription(`Something went wrong while running \`/${ctx.name}\`!\n\nContact [support]() if the issue persists.`);
                if(ctx.command.replied) await ctx.edit(embed);
                else await ctx.reply(embed, true);
            }
        }
    }
};

export default CommandManagerImpl;
export type Command = (ctx: CommandContext) => Promise<void>;

interface CommandManager {
    commands: { [name: string]: Command };
    run: (ctx: CommandContext) => Promise<void>;
};