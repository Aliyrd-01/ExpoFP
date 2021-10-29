import React from "react";
import { Meta, Story } from "@storybook/react";
import Button, { ButtonProps } from "../Button";

export default {
    title: "Components/Button",
    component: Button,
} as Meta;

const Template: Story<ButtonProps> = (args) => {
    const clicked = () => {
        alert("Clicked");
    };

    return (
        <>
            <Button {...args} onClick={clicked} />
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    text: "Text",
    disabled: false,
};
