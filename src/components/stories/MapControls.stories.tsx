import React, { useContext, useState, CSSProperties } from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import MapControls, { MapControlsProps } from "../MapControls";
import ResponsiveClassContext from "../../storybook/contexts/ResponsiveClassContext";

export default {
    title: "Components/MapControls",
    component: MapControls,
} as Meta;

const Template: Story<MapControlsProps> = (args) => {
    const [activeItems, setActiveItems] = useState(args.layersActiveItems);
    const responsiveClass = useContext(ResponsiveClassContext);

    const styles: CSSProperties = {
        position: "absolute",
        top: "10px",
        left: "386px",
    };

    const onChangeLayers = (id: string) => {
        let updatedActiveItems = [...activeItems];
        !activeItems.includes(id)
            ? (updatedActiveItems = [...activeItems, id])
            : updatedActiveItems.splice(activeItems.indexOf(id), 1);
        setActiveItems(updatedActiveItems);
        action("onChangeLayers")(id);
    };

    return (
        <div className="map layout">
            <aside className="sidebar">Hops& Highways Lounge</aside>
            <MapControls
                {...args}
                className={responsiveClass}
                style={styles}
                layersActiveItems={activeItems}
                onClickZoomIn={() => action("onClickZoomIn")(true)}
                onClickZoomOut={() => action("onClickZoomOut")(true)}
                onClickByWidth={() => action("onClickByWidth")(true)}
                onChangeLayers={(id) => onChangeLayers(id)}
            />
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    className: "fixedControls",
    titles: ["Zoom In", "Zoom Out", "By Screen Width", "Show Layouts"],
    layersOpen: false,
    layersList: [
        {
            id: "layer1",
            name: "Sizes",
        },
        {
            id: "layer2",
            name: "General Building",
        },
        {
            id: "layer3",
            name: "No Build",
        },
        {
            id: "layer4",
            name: "Venue Walls & Bay Numbers",
        },
        {
            id: "layer5",
            name: "Booths",
        },
        {
            id: "layer6",
            name: "Grid",
        },
        {
            id: "layer7",
            name: "Mapbox",
        },
    ],
    layersActiveItems: ["layer4", "layer5"],
    layersWidth: 200,
};
