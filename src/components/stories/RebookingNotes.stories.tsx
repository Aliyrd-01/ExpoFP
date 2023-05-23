import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import RebookingRadioGroup, { defaultRebookingOptions } from "../RebookingRadioGroup";
import RebookingNotes, { RebookingNotesProps } from "../RebookingNotes";

export default {
    title: "Components/RebookingNotes",
    component: RebookingNotes,
} as Meta;

const Template: Story<RebookingNotesProps> = (args) => {
    const [checkedOption, setCheckedOption] = useState<string>(defaultRebookingOptions[1].value);

    const onChangeOption = (event) => {
        setCheckedOption(event.target.value);
    };

    return (
        <div className="map layout">
            <aside className="sidebar">
                <RebookingRadioGroup
                    showTitle={false}
                    options={defaultRebookingOptions}
                    checked={checkedOption}
                    onChange={onChangeOption}
                />
                <RebookingNotes {...args} />
            </aside>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    value: "A tech floor plan is a blueprint of a building or office space that outlines the locations of technology infrastructure such as network cables, servers, and computer workstations. The plan typically includes details such as the placement of electrical outlets, network ports, and other essential components necessary for efficient technology operations.",
    //date: "01/05/2022 1:20 PM",
};
