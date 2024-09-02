import i18next, { TFunction } from "i18next";
import { loadJson } from "../tools/loaders";
import { isLocalStorageAvailable } from "./localStorage";
import { Data } from "../data/Data";
import locales from "../locales";

const loadLocale = async (locale: string) => await loadJson(`locales/${locale}.json`);

export const getLocale = () => {
    const data = window["__data"] as Data;
    const navLanguage = navigator.languages?.[0] || navigator.language;
    const navLocale = Object.keys(locales).find((x) => navLanguage.startsWith(x));
    const savedLang = isLocalStorageAvailable ? localStorage.getItem("language") : null;
    return savedLang || data.locale || navLocale || "en";
}

export const initI18n = async (defaultLocale?: string): Promise<TFunction> => {
    const locale = defaultLocale || getLocale();

    let resources = {};
    if (locale !== "en") resources[locale] = { translation: await loadLocale(locale) };

    return await i18next.init({
        resources,
        lng: locale,
        keySeparator: ".",
        saveMissing: locale !== "en",
        missingKeyHandler: (lng, ns, key, fallbackValue) =>
            console.debug(`i18n missing key. '${locale}:${key}', fallback to '${fallbackValue}'`),
    });
};

export const getLanguage = () => i18next.language;

export const t = (template: string, options?: any) => i18next.t(template, options);

export const changeLanguage = async (locale: string) => {
    if (locale.toLowerCase() !== "en" && !i18next.hasResourceBundle(locale, "translation")) {
        const json = await loadLocale(locale);
        i18next.addResourceBundle(locale, "translation", json, true, true);
    }

    await i18next.changeLanguage(locale);
    if (isLocalStorageAvailable) {
        localStorage.setItem("language", locale);
    }
};
