import { Language } from "../LanguageStore";
import RootStore from "../RootStore";
import locales from "../../locales";

export default function initLanguage(store: RootStore) {
    const savedLang = localStorage.getItem("language");
    store.languageStore.languages = Object.entries(locales).map(([id, name]) => new Language(id, name, id === savedLang));
}
