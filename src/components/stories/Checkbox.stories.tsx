import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import Checkbox, { CheckboxProps } from "../Checkbox";

export default {
    title: "Components/Checkbox",
    component: Checkbox,
    parameters: {
        usePadding: true,
    },
} as Meta;

const Template: StoryFn<CheckboxProps> = (args) => {
    const [value, setValue] = useState<boolean>(true);

    return (
        <>
            <Checkbox {...args} onChange={setValue} value={value} />
            <div className="sb-data">
                <strong>Current checked: </strong>
                {value.toString()}
            </div>
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    name: "test",
    label: "Some",
};
