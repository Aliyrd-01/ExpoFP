import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import SidebarActions, { SidebarActionsProps } from "../SidebarActions";

export default {
    title: "Components/SidebarActions",
    component: SidebarActions,
} as Meta;

const Template: Story<SidebarActionsProps> = (args) => {
    const [inBookmarks, setInBookmarks] = useState(args.inBookmark);

    const addToBookmarks = () => {
        action("onClickBookmark")(true);
        setInBookmarks(!inBookmarks);
    };

    return (
        <>
            <div className="map">
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
    showDirections: false,
};
