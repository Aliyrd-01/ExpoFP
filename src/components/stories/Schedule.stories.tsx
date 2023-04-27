import React from "react";
import { Meta, Story } from "@storybook/react";
import Schedule, { ScheduleProps } from "../Schedule";

export default {
    title: "Components/Schedule",
    component: Schedule,
} as Meta;

const Template: Story<ScheduleProps> = (args) => {
    return (
        <div className="map layout">
            <aside className="sidebar">
                <Schedule {...args} />
            </aside>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    events: [
        {
            name: "Leading and Negotiating for Success",
            startsAt: "2023-04-28T11:48:49.489Z",
            endsAt: "2023-04-28T12:40:49.489Z",
        },
        {
            name: "Discussion with Industry Thought Leader",
            startsAt: "2023-04-28T16:54:49.489Z",
            endsAt: "2023-04-28T18:20:40.489Z",
        },
        {
            name: "Terence Donnelly Memorial Health & Wellness Event",
            startsAt: "2023-04-26T11:54:12.489Z",
            endsAt: "2023-04-26T12:54:12.489Z",
            link: "https://google.com",
        },
        {
            name: "CEM Course meet",
            startsAt: "2023-04-26T07:20:12.489Z",
            endsAt: "2023-04-26T09:20:12.489Z",
        },
        {
            name: "Live Podcast",
            startsAt: "2023-04-26T10:00:25.489Z",
        },
        {
            name: "Four alpine skiers survive Monviso avalanche",
            startsAt: "2023-04-30T10:00:49.489Z",
            endsAt: "2023-04-30T12:00:49.489Z",
        },
    ],
};
