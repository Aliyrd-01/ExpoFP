import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Button, { ButtonProps } from "../Button";

export default {
    title: "Components/Button",
    component: Button,
    parameters: {
        usePadding: true,
    },
} as Meta;

const Template: StoryFn<ButtonProps> = (args) => {
    return <Button {...args} onClick={() => action("onClick")(true)} />;
};

export const Base = Template.bind({});
Base.args = {
    children: "Button",
    variant: "primary",
    size: "lg",
    disabled: false,
    inline: false,
};
