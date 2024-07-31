import i18next from "i18next";
import { computed } from "mobx";
export default class LanguageStore {
    readonly languages: Language[] = [];

    @computed get language() {
        return i18next.language;
    }
}

export class Language {
    readonly id: string;
    readonly name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
