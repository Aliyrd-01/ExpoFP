import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import SidebarActions, { SidebarActionsProps } from "../SidebarActions";

export default {
    title: "Components/SidebarActions",
    component: SidebarActions,
} as Meta;

const Template: StoryFn<SidebarActionsProps> = (args) => {
    const [inBookmarks, setInBookmarks] = useState(args.inBookmark);
    const [visited, setVisited] = useState(args.visited);

    const addToBookmarks = () => {
        action("onClickBookmark")(true);
        setInBookmarks(!inBookmarks);
    };

    const addToVisited = () => {
        action("onClickVisited")(true);
        setVisited(!visited);
    };

    return (
        <>
            <div className="map layout">
                <aside className="sidebar">
                    <div className="sidebar-container">
                        <SidebarActions
                            {...args}
                            inBookmark={inBookmarks}
                            visited={visited}
                            onClickBookmark={addToBookmarks}
                            onClickVisited={addToVisited}
                            onClickDirections={() => action("onClickDirections")(true)}
                            onClickShare={() => action("onClickShare")(true)}
                        />
                        content
                    </div>
                </aside>
            </div>
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    inBookmark: false,
    visited: false,
    showDirections: true,
    showShare: true,
    showVisited: true,
};
