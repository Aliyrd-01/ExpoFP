import React from "react";
import { Meta, Story } from "@storybook/react";
import Badge from "../Badge";

export default {
    title: "Components/Badge",
    component: Badge,
} as Meta;

const Template: Story = (args) => {
    return (
        <>
            <Badge {...args}>
                <svg width="21" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.375.833c-.805 0-1.458.653-1.458 1.459v6.877H9.5V4.006a1.25 1.25 0 0 0-2.5 0v6.323c-.639-.786-1.568-1.243-2.606-1.127-1.048.118-1.678 1.323-1.067 2.217l3.453 5.059c1.126 1.67 3.045 2.666 5.133 2.666 3.361 0 6.096-2.597 6.096-5.788L18 9.165V5.639a.958.958 0 1 0-1.917 0v3.53h-.333V3.044a1.25 1.25 0 1 0-2.5 0v6.123h-.417V2.292c0-.806-.653-1.459-1.458-1.459Z"
                        fill="#FFBF21"
                    />
                </svg>
                On hold
            </Badge>
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    variant: "ghost",
};
