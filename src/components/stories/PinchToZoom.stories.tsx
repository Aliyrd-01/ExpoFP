import React from "react";
import { Meta, Story } from "@storybook/react";
import PinchToZoom from "../PinchToZoom";

export default {
    title: "Components/PinchToZoom",
    component: PinchToZoom,
} as Meta;

const Template: Story = (args) => {
    return (
        <>
            <iframe src="https://sample.expofp.com" className="sb-iframe" title="test"></iframe>
            <PinchToZoom />
        </>
    );
};

export const Base = Template.bind({});
