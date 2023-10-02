import InfoCommand from "commands/info";
import { CommandContext } from "discord.js-slasher";

export type CommandExecutor = (ctx: CommandContext) => Promise<unknown>;

const commandMap: Record<string, CommandExecutor> = {
    info: InfoCommand
};

export default async function handleCommand(ctx: CommandContext) {
    try {
        if(commandMap[ctx.name]) await commandMap[ctx.name](ctx);
    } catch(e) {
        console.error("Failed to run command!", e);
    }
}
