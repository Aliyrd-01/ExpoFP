import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import Autocomplete, { AutocompleteProps } from "../Autocomplete";

export default {
    title: "Components/Autocomplete",
    component: Autocomplete,
} as Meta;

const Template: Story<AutocompleteProps> = (args) => {
    const [value, setValue] = useState<string>(null);
    return (
        <>
            <Autocomplete {...args} onChange={setValue} value={value} />
            <br />
            <strong>Current value: </strong>
            {value}
        </>
    );
};

export const arrayOfStrings = Template.bind({});
arrayOfStrings.args = {
    placeholder: "Select Direction from",
    options: ["one1", "one2", "one3", "two1", "two2", "three1", "three2", "four", "four2", "five", "five2", "six", "six2"],
};

export const arrayOfObjects = Template.bind({});
arrayOfObjects.args = {
    placeholder: "Select Direction from",
    options: [
        {
            value: "3102",
            label: "Event Engine - 3102",
        },
        {
            value: "1403",
            label: "EventMobi - 1403",
        },
    ],
};
