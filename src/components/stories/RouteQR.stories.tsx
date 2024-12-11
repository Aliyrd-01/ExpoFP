import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RouteQR from "../RouteQR";

const meta: Meta<typeof RouteQR> = {
    title: "Components/RouteQR",
    component: RouteQR,
    parameters: {
        layout: "left",
    },
    render: ({ ...args }) => {
        return (
            <div className="map layout efp-kiosk">
                <aside className="sidebar">
                    <RouteQR {...args} />
                </aside>
            </div>
        );
    },
};

export default meta;

type Story = StoryObj<typeof RouteQR>;

export const Default: Story = {
    args: {
        url: "https://demo.expofp.com/?route%3A209%3A232",
    },
};
