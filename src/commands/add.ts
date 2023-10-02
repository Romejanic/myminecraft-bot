import { CommandExecutor } from "cmds";

const AddCommand: CommandExecutor = async (ctx) => {
    await ctx.reply("lets add a server");
};

export default AddCommand;
