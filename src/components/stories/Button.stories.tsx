import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Button, { ButtonProps } from "../Button";

export default {
    title: "Components/Button",
    component: Button,
} as Meta;

const Template: StoryFn<ButtonProps> = (args) => {
    return <Button {...args} onClick={() => action("onClick")(true)} />;
};

export const Base = Template.bind({});
Base.args = {
    variant: "primary",
    size: "lg",
    text: "Text",
    disabled: false,
    inline: false,
};
