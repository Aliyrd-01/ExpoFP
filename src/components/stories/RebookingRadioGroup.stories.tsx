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
    options: [
        {
            name: "offer",
            value: "offer_unasked",
            label: "Unasked",
            iconName: "icon-question",
            color: "#98A2B3",
            disabled: false,
        },
        {
            name: "offer",
            value: "offer_accepted",
            label: "Accepted",
            iconName: "icon-checked",
            color: "#32B175",
            disabled: false,
        },
        {
            name: "offer",
            value: "offer_rejected",
            label: "Rejected",
            iconName: "icon-close",
            color: "#E1463C",
            disabled: false,
        },
        {
            name: "offer",
            value: "offer_undecided",
            label: "Undecided",
            iconName: "icon-refresh",
            color: "#FABA27",
            disabled: false,
        },
    ],
};
