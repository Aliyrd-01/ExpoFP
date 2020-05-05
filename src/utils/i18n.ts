import i18next, { TFunction } from 'i18next';
import Backend from 'i18next-http-backend';
import isDebug from './is-debug';

export let initI18n = async (locale: string): Promise<TFunction> => {

    return await i18next
        .use(Backend)
        .init({
            preload: ["en"].concat(locale),
            lng: locale,
            fallbackLng: 'en',                        
            backend: {
                loadPath: '/locales/{{lng}}.json'
            },
            debug: isDebug
        });
}

export let t = (template: string, options?: any) => i18next.t(template, options);