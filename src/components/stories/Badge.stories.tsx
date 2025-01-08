import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import Badge from "../Badge";

export default {
    title: "Components/Badge",
    component: Badge,
    parameters: {
        usePadding: true,
    },
} as Meta;

const Template: StoryFn = (args) => {
    return (
        <Badge {...args}>
            <i className="icon-hand-solid"></i>
            On hold
        </Badge>
    );
};

export const Base = Template.bind({});
Base.args = {
    variant: "orange",
};
