import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Alert, { AlertProps } from "../Alert";

export default {
    title: "Components/Alert",
    component: Alert,
    parameters: {
        usePadding: true,
    },
} as Meta;

const Template: StoryFn<AlertProps> = (args) => {
    const [alertOpen, setAlertOpen] = useState<boolean>(true);

    const toggleAlert = () => {
        setAlertOpen(!alertOpen);
        action("onClose")(true);
    };

    return (
        <>
            <div className="sb-data sb-data--top">
                <button onClick={() => setAlertOpen(!alertOpen)}>{alertOpen ? "Hide alert" : "Show alert"}</button>
            </div>
            {alertOpen ? (
                <Alert {...args} onClose={toggleAlert}>
                    <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                        Read how to optimize it
                    </a>
                </Alert>
            ) : null}
        </>
    );
};

export const Base = Template.bind({});
export const Position = Template.bind({});
Base.args = {
    variant: "warning",
    title: "This floor plan is too big",
    closable: true,
};
Position.args = {
    position: "bottomRight",
    variant: "warning",
    title: "This floor plan is too big",
    closable: false,
};
