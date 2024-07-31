import { Language } from "../LanguageStore";
import RootStore from "../RootStore";
import locales from "../../locales";

export default function initLanguage(store: RootStore) {
    for (const key in locales) {
        store.languageStore.languages.push(
            new Language(key, locales[key])
        );
    }
}
