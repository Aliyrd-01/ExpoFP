import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import Autocomplete, { AutocompleteProps } from "../Autocomplete";

export default {
    title: "Components/Autocomplete",
    component: Autocomplete,
} as Meta;

const Template: Story<AutocompleteProps> = (args) => {
    const [value, setValue] = useState<string>("01.351");
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
    options: ["one1", "one2", "01.351", "two1", "two2", "three1", "three2", "four", "four2", "five", "five2", "six", "six2"],
};

export const arrayOfObjects = Template.bind({});
arrayOfObjects.args = {
    placeholder: "Select Direction from",
    options: [
        {
            value: "3102",
            label:
                "Event Engine - 3102 Event Engine - 3102 Event Engine - 3102Event Engine - 3102Event Engine - 3102Event Engine - 3102Event Engine - 3102Event Engine - 3102Event Engine - 3102Event Engine - 3102",
        },
        {
            value: "1403",
            label: "EventMobi - 1403",
        },
        {
            value: "01.351",
            label: "Lumishore - 01.351",
        },
        {
            value: "01.351",
            label: "Navico - 01.152",
        },
    ],
};
