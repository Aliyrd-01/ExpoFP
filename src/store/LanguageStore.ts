import { action, computed, observable } from "mobx";
import { getLanguage, changeLanguage } from "../utils/i18n";
import RootStore from "./RootStore";

export default class LanguageStore {
    private readonly rootStore: RootStore;

    @observable
    languages: Language[] = [];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @computed
    get language() {
        return this.languages.find(l => l.id === getLanguage());
    }

    @action
    async changeLanguage(id: string) {
        await changeLanguage(id);

        this.languages.forEach(l => {
            l.selected = l.id === id;
        });

        this.rootStore.selectLanguage();
    }
}

export class Language {
    readonly id: string;
    readonly name: string;
    @observable selected: boolean;

    constructor(id: string, name: string, selected = false) {
        this.id = id;
        this.name = name;
        this.selected = selected;
    }
}
