import React from "react";
import { Meta, Story } from "@storybook/react";
import Autocomplete, { AutocompleteProps } from "../Autocomplete";

export default {
    title: "Components/Autocomplete",
    component: Autocomplete,
} as Meta;

const Template: Story<AutocompleteProps> = (args) => {
    return (
        <>
            <Autocomplete {...args} />
        </>
    );
};

export const Base = Template.bind({});
Base.args = {};
