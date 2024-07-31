import { Meta } from "@storybook/react";
import Radio from "../Radio";
import { fn } from "@storybook/test";
import React from "react";

export default {
    title: "Components/Radio",
    component: Radio,
    argTypes: {
        checked: { control: "boolean" },
        value: { control: "text" },
        label: { control: "text" },
    },
    args: {
        value: "test",
        label: "Text",
        onChange: fn(),
    },
} as Meta;

export const Base = {};

export const Checked = {
    args: {
        checked: true,
    },
};

export const Multiple = {
    decorators: [
        (Story) => (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Story />
                <Story />
            </div>
        ),
    ],
};