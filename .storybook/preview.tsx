import type { Preview } from "@storybook/react";
import React from "react";
import "../src/styles/storybook.global.scss";
import StoryWrapper from "../src/storybook/decorators/StoryWrapper";
import WithResize from "../src/storybook/decorators/WithResize";
import ToastProvider from "../src/components/Toast/ToastProvider";

const preview: Preview = {
    decorators: [
        (Story) => {
            return (
                <ToastProvider>
                    <StoryWrapper render={(init: boolean) => (init ? <Story /> : "Loading")} />
                </ToastProvider>
            );
        },
        (Story) => {
            const WrappedStory = WithResize(Story);
            return <WrappedStory />;
        },
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
