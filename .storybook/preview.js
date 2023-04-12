import "../src/styles/storybook.global.scss";
import StoryWrapper from "./StoryWrapper";
import ToastProvider from "../src/components/Toast/ToastProvider";

export const decorators = [
    (Story) => {
        return (
            <ToastProvider>
                <StoryWrapper
                    render={(init) => {
                        return init ? <Story /> : "Loading";
                    }}
                />
            </ToastProvider>
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
