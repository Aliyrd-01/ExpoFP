import React from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import MapControls, { MapControlsProps } from "../MapControls";

export default {
    title: "Components/MapControls",
    component: MapControls,
} as Meta;

const Template: Story<MapControlsProps> = (args) => {
    return (
        <>
            <MapControls
                {...args}
                onClickZoomIn={() => action("onClickZoomIn")(true)}
                onClickZoomOut={() => action("onClickZoomOut")(true)}
                onClickByWidth={() => action("onClickByWidth")(true)}
                onChangeLayers={(value) => action("onChangeLayers")(value)}
            />
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    titles: ["Zoom In", "Zoom Out", "By Screen Width", "Show Layouts"],
    layersOpen: false,
    layersList: [
        {
            id: "layer1",
            name: "Stats",
        },
        {
            id: "layer2",
            name: "Sizes",
        },
        {
            id: "layer3",
            name: "Technical",
        },
        {
            id: "layer4",
            name: "Utillity Grid",
        },
        {
            id: "layer5",
            name: "Rigging",
        },
    ],
    layersActiveItems: ["layer4", "layer5"],
};
