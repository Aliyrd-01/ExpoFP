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

    const addToBookmarks = () => {
        action("onClickBookmark")(true);
        setInBookmarks(!inBookmarks);
    };

    return (
        <>
            <div className="map layout">
                <aside className="sidebar">
                    <SidebarActions
                        {...args}
                        inBookmark={inBookmarks}
                        onClickBookmark={addToBookmarks}
                        onClickDirections={() => action("onClickDirections")(true)}
                        onClickShare={() => action("onClickShare")(true)}
                    />
                    content
                </aside>
            </div>
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    inBookmark: false,
    showDirections: true,
    showShare: true,
};
