import "../src/styles/storybook.global.scss";
import i18next from "i18next";

i18next.init({});

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};
