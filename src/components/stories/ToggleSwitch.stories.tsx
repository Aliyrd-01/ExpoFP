import React, { useContext, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import ToggleSwitch, { ToggleSwitchProps } from "../ToggleSwitch";
import ResponsiveClassContext from "../../storybook/contexts/ResponsiveClassContext";

export default {
    title: "Components/ToggleSwitch",
    component: ToggleSwitch,
} as Meta;

const Template: StoryFn<ToggleSwitchProps> = (args) => {
    const [value, setValue] = useState<boolean>(true);
    const responsiveClass = useContext(ResponsiveClassContext);

    return (
        <div className="layout sb-layout">
            <ToggleSwitch {...args} className={responsiveClass} onChange={setValue} value={value} />
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
