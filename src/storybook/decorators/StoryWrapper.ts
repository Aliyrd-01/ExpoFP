import { useEffect, useState } from "react";
import locales from "../../locales";
import i18next from "i18next";

const StoryWrapper = ({ render }) => {
    const [initialized, setInit] = useState(false);

    useEffect(() => {
        (async function () {
            let resources = {};

            const navLanguage = navigator.languages?.[0] || navigator.language;
            const navLocale = Object.keys(locales).find((x) => navLanguage.startsWith(x));
            const locale = navLocale || "en";

            if (locale !== "en") {
                resources[locale] = { translation: await fetch(`/locales/${locale}.json`).then((res) => res.json()) };
            }
            await i18next.init({
                resources,
                fallbackLng: "en",
                lng: locale,
            });
            setInit(true);
        })();
    }, []);

    return render(initialized);
};

export default StoryWrapper;
