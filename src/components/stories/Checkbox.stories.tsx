import React from "react";
import { Meta, Story } from "@storybook/react";
import Checkbox, { CheckboxProps } from "../Checkbox";

export default {
    title: "Components/Checkbox",
    component: Checkbox,
} as Meta;

const Template: Story<CheckboxProps> = (args) => {
    return (
        <>
            <Checkbox {...args} />
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    name: "test",
    value: true,
    label: "Some",
};
