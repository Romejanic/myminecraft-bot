import { Modal, ModalSubmitInteraction } from "discord-modals";
import { CommandContext } from "discord.js-slasher";
import EventEmitter from 'events';
import TypedEmitter from "typed-emitter";

type ModalCollectorEvents = {
    submit: (modal: ModalSubmitInteraction) => any;
    end: (timeout: boolean) => any;
};

export default function createModalSubmitCollector(ctx: CommandContext, modal: Modal) {
    const emitter = new EventEmitter() as TypedEmitter<ModalCollectorEvents>;
    const handler = (i: ModalSubmitInteraction) => {
        if(i.customId === modal.customId && i.user.id === ctx.user.id) {
            emitter.emit("submit", i);
            emitter.emit("end", false);
            ctx.client.off("modalSubmit", handler);
            clearTimeout(timeout);
        }
    };
    
    const timeout = setTimeout(() => {
        ctx.client.off("modalSubmit", handler);
        emitter.emit("end", true);    
    }, 10 * 60 * 1000);

    ctx.client.on("modalSubmit", handler);

    return emitter;
}