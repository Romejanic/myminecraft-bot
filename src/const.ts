import { AttachmentBuilder } from "discord.js";

export const BOT_VERSION    = Bun.env["npm_package_version"] || "n/a";

export const INVITE_LINK    = "https://discord.com/api/oauth2/authorize?client_id=793150744533925888&permissions=3072&scope=bot%20applications.commands";
export const SUPPORT_SERVER = "https://discord.gg/fawJ2dTxFS";
export const BUG_REPORTS    = "https://github.com/Romejanic/myminecraft-bot/issues/new/choose";
export const GITHUB_LINK    = "https://github.com/Romejanic/myminecraft-bot";
export const EMBED_COLOR    = "#4e7a39";

export const SERVER_LIMIT   = 5;

export type EmbedImage    = [string, AttachmentBuilder];
export type ServerAddress = [string, number];
export type Maybe<T>      = T | null;

export function botIcon(): EmbedImage {
    const name = "attachment://icon.png";
    return [name, new AttachmentBuilder("icon.png")];
}
