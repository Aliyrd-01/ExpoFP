import { getLanguage, changeLanguage } from "../utils/i18n";

export default class LanguageStore {
    readonly languages: Language[] = [];

   get language() {
        const lang = this.languages.find(l => l.id === getLanguage());
        return lang?.name;
    }

    async changeLanguage(id: string) {
        return changeLanguage(id);
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
