import "../src/styles/storybook.global.scss";
import StoryWrapper from "./StoryWrapper";

export const decorators = [
    (Story) => {
        return (
            <StoryWrapper
                render={(init) => {
                    return init ? <Story /> : "Loading";
                }}
            />
        );
    },
];

export const parameters = {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};
