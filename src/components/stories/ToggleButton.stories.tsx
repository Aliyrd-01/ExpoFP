import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import ToggleButton, { ToggleButtonProps } from "../ToggleButton";

export default {
    title: "Components/ToggleButton",
    component: ToggleButton,
    parameters: {
        usePadding: true,
    },
} as Meta;

const Template: StoryFn<ToggleButtonProps> = (args) => {
    const [value, setValue] = useState<boolean>(false);

    return (
        <>
            <ToggleButton {...args} toggled={value} onClick={() => setValue(!value)} />
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    label: "Visited",
};
