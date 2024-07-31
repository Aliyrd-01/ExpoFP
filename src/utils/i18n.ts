import i18next, { TFunction } from "i18next";
import { loadJson } from "../tools/loaders";

const loadLocale = async (locale: string) => await loadJson(`locales/${locale}.json`);

export const initI18n = async (locale: string): Promise<TFunction> => {
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
    localStorage.setItem("language", locale);
};
