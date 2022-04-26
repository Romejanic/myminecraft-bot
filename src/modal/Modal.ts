import { CommandInteraction, Interaction } from "discord.js";
import { CommandContext } from "discord.js-slasher";
import { Routes } from 'discord-api-types/v8';
import TextInput from "./TextInput";

const ACTION_ROW_TYPE = 1;
const MODAL_RESPONSE_TYPE = 9;

export default class Modal {

    private title: string;
    private customId: string;
    private fields: TextInput[][] = [];

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
        const url = "https://discord.com/api/v8" + Routes.interactionCallback(id, token);
        const resp = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                type: MODAL_RESPONSE_TYPE,
                data: this.toJSON()
            }),
            headers: {
                'Content-Type': "application/json"
            }
        });
        if(resp.ok && this.interaction.isCommand()) {
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