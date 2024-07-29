import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import WayfindingFloorSelector, { WayfindingFloorSelectorProps } from "../WayfindingFloorSelector";

export default {
    title: "Components/WayfindingFloorSelector",
    component: WayfindingFloorSelector,
} as Meta;

const Template: StoryFn<WayfindingFloorSelectorProps> = (args) => {
    const [currentFloor, setCurrentFloor] = useState<{id: number, name: string}>(args.current);
    const changeFloor = (val: {id: number, name: string}) => {
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
    floors: [
        {
            id: 1,
            name: "1"
        },
        {
            id: 2,
            name: "2"
        },
        {
            id: 3,
            name: "3"
        },
        {
            id: 4,
            name: "4"
        },
        {
            id: 5,
            name: "5"
        }
    ],
    current: {
        id: 2,
        name: "2"
    },
};