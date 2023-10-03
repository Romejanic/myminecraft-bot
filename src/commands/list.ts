import { CommandExecutor } from "cmds";

const ListCommand: CommandExecutor = async (ctx) => {
    await ctx.reply("foo");
};

export default ListCommand;
