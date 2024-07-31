export default class LanguageStore {
    language: string;
    readonly languages: Language[] = [];
}

export class Language {
    readonly id: string;
    readonly name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
