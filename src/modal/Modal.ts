import { CommandInteraction, Interaction } from "discord.js";
import { REST } from '@discordjs/rest';
import { CommandContext } from "discord.js-slasher";
import { Routes } from 'discord-api-types/v8';
import TextInput from "./TextInput";

const ACTION_ROW_TYPE = 1;
const MODAL_RESPONSE_TYPE = 9;

export default class Modal {

    private title: string;
    private customId: string;
    private fields: TextInput[][];

    private interaction: Interaction;

    constructor(ctx: CommandContext) {
        this.interaction = ctx.command;
    }

    public setTitle(title: string) {
        this.title = title;
        return this;
    }

    public setCustomID(customId: string) {
        this.customId = customId;
        return this;
    }

    public addRows(fields: TextInput[]) {
        this.fields.push(fields);
        return this;
    }

    public async show() {
        const { id, token } = this.interaction;
        const rest = new REST();
        await rest.post(Routes.interactionCallback(id, token), {
            body: {
                type: MODAL_RESPONSE_TYPE,
                data: this.toJSON()
            },
            auth: false
        });
        if(this.interaction.isCommand()) {
            (this.interaction as CommandInteraction).replied = true;
        }
    }

    public toJSON() {
        const fieldMapper = (f: TextInput[]) => {
            return {
                type: ACTION_ROW_TYPE,
                components: f.map(t => t.toJSON())
            };
        };
        return {
            title: this.title,
            custom_id: this.customId,
            components: this.fields.map(fieldMapper)
        };
    }

};