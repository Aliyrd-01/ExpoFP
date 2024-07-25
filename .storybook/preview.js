import React from "react";
import "../src/styles/storybook.global.scss";
import StoryWrapper from "../src/storybook/decorators/StoryWrapper";
import WithResize from "../src/storybook/decorators/WithResize";
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
    (Story) => {
        const WrappedStory = WithResize(Story);
        return <WrappedStory />;
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
