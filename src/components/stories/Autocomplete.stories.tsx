import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import Autocomplete, { AutocompleteProps } from "../Autocomplete";

export default {
    title: "Components/Autocomplete",
    component: Autocomplete,
} as Meta;

const Template: StoryFn<AutocompleteProps> = (args) => {
    const [value, setValue] = useState<string>("02");
    return (
        <>
            <Autocomplete {...args} onChange={setValue} value={value} />
            <div className="sb-data">
                <strong>Current value: </strong>
                {value}
            </div>
        </>
    );
};

export const arrayOfStrings = Template.bind({});
arrayOfStrings.args = {
    placeholder: "Select Direction from",
    options: ["one1", "one2", "02", "two1", "two2", "three1", "three2", "four", "four2", "five", "five2", "six", "six2"],
};

export const arrayOfObjects = Template.bind({});
arrayOfObjects.args = {
    placeholder: "Select Direction from",
    options: [
        {
            value: "01",
            label: "Event Engine - 01",
        },
        {
            value: "02",
            label: "EventMobi - 02",
        },
        {
            value: "03",
            label: "Lumishore - 03",
        },
        {
            value: "04",
            label: "Navico - 04",
        },
        {
            value: "05",
            label: "Nabuus - 05",
        },
        {
            value: "06",
            label: "Namokq - 06",
        },
    ],
};
