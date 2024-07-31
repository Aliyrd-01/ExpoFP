import { Language } from "../LanguageStore";
import RootStore from "../RootStore";

export default function initLanguage(store: RootStore) {
    // TODO: load JSON form server
    const languages = {
        "en": "English",
        "de": "German",
        "fr": "French",
        "es": "Spanish",
    };

    for (const key in languages) {
        store.languageStore.languages.push(
            new Language(key, languages[key])
        );
    }
}