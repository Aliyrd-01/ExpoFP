import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import RebookingRadioGroup, { RebookingRadioGroupProps } from "../RebookingRadioGroup";
import { useToast } from "../Toast/index";

export default {
    title: "Components/RebookingRadioGroup",
    component: RebookingRadioGroup,
} as Meta;

const Template: Story<RebookingRadioGroupProps> = (args) => {
    const [checkedOption, setCheckedOption] = useState<string>(args.options[1].value);
    const toast = useToast();

    const onChangeOption = (event) => {
        setCheckedOption(event.target.value);
        toast.open("Changes saved", 2000);
        action("onChange")(event.target.value);
    };

    return (
        <div className="map layout">
            <aside className="sidebar">
                <RebookingRadioGroup {...args} checked={checkedOption} onChange={onChangeOption} />
            </aside>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    showTitle: true,
    options: [
        {
            type: "unasked",
            name: "offer",
            value: "offer_unasked",
            label: "Unasked",
            iconName: "icon-question",
            disabled: false,
        },
        {
            type: "accepted",
            name: "offer",
            value: "offer_accepted",
            label: "Accepted",
            iconName: "icon-checked",
            disabled: false,
        },
        {
            type: "rejected",
            name: "offer",
            value: "offer_rejected",
            label: "Rejected",
            iconName: "icon-close",
            disabled: false,
        },
        {
            type: "undecided",
            name: "offer",
            value: "offer_undecided",
            label: "Undecided",
            iconName: "icon-switch-horizontal",
            disabled: false,
        },
    ],
};
