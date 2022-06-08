import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import ToggleSwitch, { ToggleSwitchProps } from "../ToggleSwitch";

export default {
    title: "Components/ToggleSwitch",
    component: ToggleSwitch,
} as Meta;

const Template: Story<ToggleSwitchProps> = (args) => {
    const [value, setValue] = useState<boolean>(true);

    return (
        <div className="sbContent">
            <ToggleSwitch {...args} onChange={setValue} value={value} />
            <br />
            <br />
            <strong>Current checked: </strong>
            {value.toString()}
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    name: "test",
    label: "Test label",
};
