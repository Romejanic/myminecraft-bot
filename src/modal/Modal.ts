import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Client, CommandInteraction, Interaction, InteractionReplyOptions, InteractionWebhook, Message } from "discord.js";
import { CommandContext } from "discord.js-slasher";
import { APIMessage, Routes } from 'discord-api-types/v9';
import axios from 'axios';
import TextInput from "./TextInput";
import { InteractionResponseTypes } from 'discord.js/typings/enums';

const ACTION_ROW_TYPE = 1;
const MODAL_RESPONSE_TYPE = 9;
const MODAL_SUBMIT_TYPE = 5;

type ModalEvents = {
    submit: (result: ModalResult) => void;
    cancel: () => void;
};

interface ModalSubmitInteraction {
    type: number;
    id: string;
    token: string;
    data: {
        custom_id: string;
        components: PartialActionRow[]
    }
};

interface PartialActionRow {
    type: number;
    components: PartialTextInput[];
};

interface PartialTextInput {
    type: number;
    custom_id: string;
    value: string;
};

export interface ModalResult {
    submitted: boolean;
    values?: { [key: string]: string };
}

export default class Modal {

    private title: string;
    private customId: string;
    private fields: TextInput[][] = [];

    private readonly interaction: Interaction;
    private readonly client: Client;

    private readonly emitter: TypedEmitter<ModalEvents>;
    private submitInteraction: ModalSubmitInteraction;

    constructor(ctx: CommandContext) {
        this.interaction = ctx.command;
        this.client = ctx.client;
        this.emitter = new EventEmitter() as TypedEmitter<ModalEvents>;
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
        const url = "https://discord.com/api/v9" + Routes.interactionCallback(id, token);
        await axios.post(url, {
            type: MODAL_RESPONSE_TYPE,
            data: this.toJSON()
        });
        if(this.interaction.isCommand()) {
            (this.interaction as CommandInteraction).replied = true;
        }

        const submitListener = (i: ModalSubmitInteraction) => {
            if(i.type === MODAL_SUBMIT_TYPE && i.data.custom_id === this.customId) {
                const values = {};
                i.data.components.forEach(f => {
                    f.components.forEach(t => {
                        values[t.custom_id] = t.value;
                    });
                });
                this.emitter.emit("submit", {
                    submitted: true, values
                });
                clearTimeout(timeout);
                this.submitInteraction = i;
                this.client.ws.off("INTERACTION_CREATE", submitListener);
            }
        };
        const timeout = setTimeout(() => {
            this.emitter.emit("submit", { submitted: false });
            this.client.ws.off("INTERACTION_CREATE", submitListener);
        }, 10 * 60 * 1000); // 10 mins
        this.client.ws.on("INTERACTION_CREATE", submitListener);
    }

    public result(): Promise<ModalResult> {
        return new Promise((resolve) => {
            this.emitter.once("submit", resolve);
        });
    }

    public async showAndWait() {
        await this.show();
        return await this.result();
    }

    public async reply(data: InteractionReplyOptions): Promise<APIMessage | Message<boolean>> {
        if(!this.submitInteraction) {
            throw "Cannot reply until the modal is submitted";
        }
        const { id, token } = this.submitInteraction;
        const url = "https://discord.com/api/v9" + Routes.interactionCallback(id, token);
        await axios.post(url, {
            type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE, data
        });
        return null;
        // const webhook = new InteractionWebhook(this.client, this.client.application.id, this.interaction.token);
        // return await webhook.fetchMessage("@original");
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