import { CommandExecutor } from "cmds";

const InfoCommand: CommandExecutor = async (ctx) => {
    await ctx.reply("This is the /info command");
};

export default InfoCommand;
