import AddCommand from "commands/add";
import InfoCommand from "commands/info";
import { CommandContext } from "discord.js-slasher";
import createLogger from "logger";

const logger = createLogger("Commands");

export type CommandExecutor = (ctx: CommandContext) => Promise<unknown>;

const commandMap: Record<string, CommandExecutor> = {
    info: InfoCommand,
    add: AddCommand
};

export default async function handleCommand(ctx: CommandContext) {
    try {
        if(commandMap[ctx.name]) await commandMap[ctx.name](ctx);
    } catch(e) {
        logger.error("Failed to run command!", e);
    }
}
