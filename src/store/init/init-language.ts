import { Language } from "../LanguageStore";
import RootStore from "../RootStore";
import locales from "../../locales";

export default function initLanguage(store: RootStore) {
    const savedLang = localStorage.getItem("language");
    store.languageStore.languages = Object.entries(locales)
        .sort(
            (a, b) => a[0].localeCompare(b[0])
        )
        .map(
            ([id, name]) => new Language(id, name, id === savedLang)
        );
}
