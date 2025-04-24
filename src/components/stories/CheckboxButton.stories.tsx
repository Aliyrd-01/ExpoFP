import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import CheckboxButton, { CheckboxButtonProps } from "../CheckboxButton";

export default {
    title: "Components/CheckboxButton",
    component: CheckboxButton,
    parameters: {
        usePadding: true,
    },
} as Meta;

const Template: StoryFn<CheckboxButtonProps> = (args) => {
    const [value, setValue] = useState<boolean>(false);

    return (
        <>
            <CheckboxButton {...args} checked={value} onClick={() => setValue(!value)} />
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    label: "Visited",
};
