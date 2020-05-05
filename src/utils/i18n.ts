import i18next, { TFunction } from "i18next";
import { loadJson } from "../tools/loaders";
import isDebug from "./is-debug";

export let initI18n = async (locale: string): Promise<TFunction> => {
    let resources = {};
    if (locale !== "en") resources[locale] = { translation: await loadJson(`/locales/${locale}.json`) };

    return await i18next.init({
        resources,
        lng: locale,
        debug: isDebug,
    });
};

export let t = (template: string, options?: any) => i18next.t(template, options);
