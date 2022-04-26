import { Command } from "./manager";

const InfoCommand: Command = async (ctx) => {
    await ctx.reply("working");
};

export default InfoCommand;