import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Alert, { AlertProps } from "../Alert";

export default {
    title: "Components/Alert",
    component: Alert,
} as Meta;

const Template: Story<AlertProps> = (args) => {
    const [alertOpen, setAlertOpen] = useState<boolean>(true);

    const toggleAlert = () => {
        setAlertOpen(!alertOpen);
        action("onClose")(true);
    };

    return (
        <div className="sbContent">
            <button onClick={() => setAlertOpen(!alertOpen)}>{alertOpen ? "Hide alert" : "Show alert"}</button>
            <br />
            <br />
            {alertOpen ? (
                <Alert {...args} onClose={toggleAlert}>
                    <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                        Read how to optimize it
                    </a>
                </Alert>
            ) : null}
        </div>
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
