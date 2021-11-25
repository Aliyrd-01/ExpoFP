import React from "react";
import { Meta, Story } from "@storybook/react";
import WayInformation, { WayInformationProps } from "../WayInformation";

export default {
    title: "Components/WayInformation",
    component: WayInformation,
} as Meta;

const Template: Story<WayInformationProps> = (args) => {
    return (
        <>
            <WayInformation {...args} />
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    items: [
        {
            title: "Travel time",
            text: "10 min",
        },
        {
            title: "Distance",
            text: "170 m",
        },
        {
            title: "Est arrival",
            text: "2:41pm",
        },
    ],
};
