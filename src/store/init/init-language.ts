import { Language } from "../LanguageStore";
import RootStore from "../RootStore";

export default function initLanguage(store: RootStore) {
    const languages = window["__languageData"] || {};
    for (const key in languages) {
        store.languageStore.languages.push(
            new Language(key, languages[key])
        );
    }
}
