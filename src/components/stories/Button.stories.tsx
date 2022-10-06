import React from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Button, { ButtonProps } from "../Button";

export default {
    title: "Components/Button",
    component: Button,
} as Meta;

const Template: Story<ButtonProps> = (args) => {
    return (
        <div className="layout">
            <Button {...args} onClick={() => action("onClick")(true)} />
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    text: "Text",
    disabled: false,
    inline: false,
};
