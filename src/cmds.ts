import { CommandContext } from "discord.js-slasher";
import { EmbedBuilder } from "discord.js";
import { BUG_REPORTS } from "const";
import createLogger from "logger";

import AddCommand from "commands/add";
import InfoCommand from "commands/info";
import ListCommand from "commands/list";
import StatusCommand from "commands/status";
import RemoveCommand from "commands/remove";
import PlayersCommand from "commands/players";

const logger = createLogger("Commands");

export type CommandExecutor = (ctx: CommandContext) => Promise<unknown>;

const commandMap: Record<string, CommandExecutor> = {
    info: InfoCommand,
    add: AddCommand,
    list: ListCommand,
    status: StatusCommand,
    remove: RemoveCommand,
    players: PlayersCommand
};

export default async function handleCommand(ctx: CommandContext) {
    try {
        if(commandMap[ctx.name]) await commandMap[ctx.name](ctx);
        else throw new Error(`Unrecognised command: /${ctx.name}`);
    } catch(e) {
        logger.error("Failed to run command!", e);
        const embed = new EmbedBuilder()
            .setTitle("Something went wrong!")
            .setDescription(`Sorry, a problem occurred while running this command. Please try again later or [submit a bug report](${BUG_REPORTS}).`)
            .setColor("Red");
        if(ctx.command.replied) await ctx.edit(embed);
        else await ctx.reply(embed);
    }
}
