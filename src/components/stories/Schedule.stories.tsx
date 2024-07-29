import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import Schedule, { ScheduleProps } from "../Schedule";

export default {
    title: "Components/Schedule",
    component: Schedule,
} as Meta;

const Template: StoryFn<ScheduleProps> = (args) => {
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
            id: 1971456,
            name: "Leading and Negotiating for Success",
            startDate: "2024-04-28T11:48:49.489Z",
            endDate: "2024-04-28T12:40:49.489Z",
            description:
                '<p>&lt;Slope Sonic&gt; is a group of friends, dreamers, <strong>creative types</strong>, artists, DJs, professionals. Our camp space will be filled with music and art. We welcome you to dance with us, have a cup of coffee and share good vibes. Saturday during the day we are throwing Super Dance party not to be missed."&nbsp;</p>',
        },
        {
            id: 42571456,
            name: "Discussion with Industry Thought Leader",
            startDate: "2024-04-28T16:54:49.489Z",
            endDate: "2024-04-28T18:20:40.489Z",
        },
        {
            id: 64656,
            name: "Terence Donnelly Memorial Health & Wellness Event",
            startDate: "2024-04-26T11:54:12.489Z",
            endDate: "2024-04-26T12:54:12.489Z",
            link: "https://google.com",
            description:
                "The season will feature 10 teams and follow the same format as the previous year, with each side playing 14 league games (7 at home and 7 away). The top 4 teams from the standings will progress to the playoffs, and while the dates for these games have not yet been announced, the finals will take place on May 28th, 2023, after the league stage concludes on May 21st.There will be a total of 74 matches in the IPL, comprising 70 league games and 4 playoff matches. This season, 18 double headers are scheduled, with the afternoon game at 3.30 PM IST and the evening match at 7.30 PM IST.",
        },
        {
            id: 65543343,
            name: "CEM Course meet",
            startDate: "2024-04-26T07:20:12.489Z",
            endDate: "2024-04-26T09:20:12.489Z",
        },
        {
            id: 7771456,
            name: "Live Podcast",
            startDate: "2024-04-26T10:00:25.489Z",
        },
        {
            id: 523452,
            name: "Four alpine skiers survive Monviso avalanche",
            startDate: "2024-04-30T10:00:49.489Z",
            endDate: "2024-04-30T12:00:49.489Z",
            description: "A 75 minute fast paced performance that uniquely blends stand-up comedy",
        },
    ],
};
