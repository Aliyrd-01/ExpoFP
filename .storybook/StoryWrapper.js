import React, { useEffect, useState } from "react";
import _locales from "../public/locales/_locales";
import i18next from "i18next";

const StoryWrapper = ({ render }) => {
    const [initialized, setInit] = useState(false);

    useEffect(() => {
        (async function () {
            let resources = {};

            const navLanguage = navigator.languages?.[0] || navigator.language;
            const navLocale = _locales.find((x) => navLanguage.startsWith(x));
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
