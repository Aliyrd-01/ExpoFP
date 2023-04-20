import React from "react";
import { Meta } from "@storybook/react";
import { useToast } from "../Toast/index";

export default {
    title: "Components/Toast",
} as Meta;

const Template = () => {
    const toast = useToast();

    const handleButtonClick = () => {
        toast.open("Changes saved", 2000);
    };

    return (
        <div className="map layout">
            <aside className="sidebar">
                <button onClick={handleButtonClick}>Open Toast</button>
            </aside>
        </div>
    );
};

export const Base = Template.bind({});
