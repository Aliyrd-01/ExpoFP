import type { Preview } from "@storybook/react";
import React from "react";
import "../src/styles/_sb.scss";
import StoryWrapper from "../src/storybook/decorators/StoryWrapper";
import WithResize from "../src/storybook/decorators/WithResize";
import ToastProvider from "../src/components/Toast/ToastProvider";

const preview: Preview = {
    decorators: [
        (Story, context) => {
            const { usePadding } = context.parameters;
            const className = `layout sb-layout${usePadding ? " with-padding" : ""}`;

            return (
                <div id="efp-layout" className={className}>
                    <ToastProvider>
                        <StoryWrapper render={(init: boolean) => (init ? <Story /> : "Loading")} />
                    </ToastProvider>
                </div>
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
