import "../src/styles/storybook.global.scss";
import StoryWrapper from "../src/storybook/decorators/StoryWrapper";
import WithResize from "../src/storybook/decorators/WithResize";

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
