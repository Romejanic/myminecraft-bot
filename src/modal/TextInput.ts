const TEXT_INPUT_TYPE = 4;

export enum TextInputStyle {
    Short = 1,
    Paragraph = 2
};

export default class TextInput {

    private label: string;
    private style: TextInputStyle;
    private customId: string;
    private minLength: number;
    private maxLength: number;
    private placeholder: string;
    private required: boolean;

    public setLabel(label: string) {
        this.label = label;
        return this;
    }

    public setStyle(style: TextInputStyle) {
        this.style = style;
        return this;
    }

    public setCustomID(customId: string) {
        this.customId = customId;
        return this;
    }

    public setMinLength(minLength: number) {
        this.minLength = minLength;
        return this;
    }

    public setMaxLength(maxLength: number) {
        this.maxLength = maxLength;
        return this;
    }

    public setPlaceholder(placeholder: string) {
        this.placeholder = placeholder;
        return this;
    }

    public setRequired(required: boolean) {
        this.required = required;
        return this;
    }

    public toJSON() {
        return {
            type: TEXT_INPUT_TYPE,
            custom_id: this.customId,
            label: this.label,
            style: this.style as number,
            min_length: this.minLength,
            max_length: this.maxLength,
            placeholder: this.placeholder,
            required: this.required
        };
    }

}