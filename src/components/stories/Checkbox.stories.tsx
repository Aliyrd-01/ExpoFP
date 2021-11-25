import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import Checkbox, { CheckboxProps } from "../Checkbox";

export default {
    title: "Components/Checkbox",
    component: Checkbox,
} as Meta;

const Template: Story<CheckboxProps> = (args) => {
    const [value, setValue] = useState<boolean>(true);

    return (
        <>
            <Checkbox {...args} onChange={setValue} value={value} />
            <br />
            <br />
            <strong>Current checked: </strong>
            {value.toString()}
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    name: "test",
    label: "Some",
};
