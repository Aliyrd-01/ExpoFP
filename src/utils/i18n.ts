import i18next, { TFunction } from "i18next";
import { loadJson } from "../tools/loaders";

export const initI18n = async (locale: string): Promise<TFunction> => {
    let resources = {};
    if (locale !== "en") resources[locale] = { translation: await loadJson(`locales/${locale}.json`) };

    return await i18next.init({
        resources,
        lng: locale,
        keySeparator: ".",
        saveMissing: locale !== "en",
        missingKeyHandler: (lng, ns, key, fallbackValue) =>
            console.debug(`i18n missing key. '${locale}:${key}', fallback to '${fallbackValue}'`),
    });
};

export const getlanguage = () => i18next.language;

export const t = (template: string, options?: any) => i18next.t(template, options);
