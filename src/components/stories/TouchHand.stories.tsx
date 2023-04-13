import React from "react";
import { Meta, Story } from "@storybook/react";
import TouchHand from "../TouchHand";

export default {
    title: "Components/TouchHand",
    component: TouchHand,
} as Meta;

const Template: Story = (args) => {
    return (
        <>
            <iframe src="https://sample.expofp.com" className="sb-iframe" title="test"></iframe>
            <TouchHand />
        </>
    );
};

export const Base = Template.bind({});
