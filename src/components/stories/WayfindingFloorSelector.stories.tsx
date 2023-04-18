import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import WayfindingFloorSelector, { WayfindingFloorSelectorProps } from "../WayfindingFloorSelector";

export default {
    title: "Components/WayfindingFloorSelector",
    component: WayfindingFloorSelector,
} as Meta;

const Template: Story<WayfindingFloorSelectorProps> = (args) => {
    const [currentFloor, setCurrentFloor] = useState<string>(args.current);
    const changeFloor = (val: string) => {
        setCurrentFloor(val);
        action("onClickFloor")(val);
    };

    return (
        <div className="map layout">
            <aside className="sidebar">
                <WayfindingFloorSelector {...args} current={currentFloor} onClickFloor={changeFloor} />
            </aside>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    floors: ["1", "2", "3", "4"],
    current: "2",
};
