import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import Schedule, { ScheduleProps } from "../Schedule";
import { EventItem } from "../../store/EventStore";

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
        new EventItem(
            1971456,
            "event-1971456",
            1,
            1,
            "Leading and Negotiating for Success",
            '<p>&lt;Slope Sonic&gt; is a group of friends, dreamers, <strong>creative types</strong>, artists, DJs, professionals. Our camp space will be filled with music and art. We welcome you to dance with us, have a cup of coffee and share good vibes. Saturday during the day we are throwing Super Dance party not to be missed."&nbsp;</p>',
            "2024-04-28T11:48:49.489Z",
            "2024-04-28T12:40:49.489Z"
        ),
        new EventItem(
            42571456,
            "event-42571456",
            2,
            2,
            "Discussion with Industry Thought Leader",
            "",
            "2024-04-28T16:54:49.489Z",
            "2024-04-28T18:20:40.489Z"
        ),
        new EventItem(
            64656,
            "event-64656",
            3,
            3,
            "Terence Donnelly Memorial Health & Wellness Event",
            "The season will feature 10 teams and follow the same format as the previous year, with each side playing 14 league games (7 at home and 7 away). The top 4 teams from the standings will progress to the playoffs, and while the dates for these games have not yet been announced, the finals will take place on May 28th, 2023, after the league stage concludes on May 21st.There will be a total of 74 matches in the IPL, comprising 70 league games and 4 playoff matches. This season, 18 double headers are scheduled, with the afternoon game at 3.30 PM IST and the evening match at 7.30 PM IST.",
            "2024-04-26T11:54:12.489Z",
            "2024-04-26T12:54:12.489Z",
            "https://google.com"
        ),
        new EventItem(
            65543343,
            "event-65543343",
            4,
            4,
            "CEM Course meet",
            "",
            "2024-04-26T07:20:12.489Z",
            "2024-04-26T09:20:12.489Z"
        ),
        new EventItem(7771456, "event-7771456", 5, 5, "Live Podcast", "", "2024-04-26T10:00:25.489Z", ""),
        new EventItem(
            523452,
            "event-523452",
            6,
            6,
            "Four alpine skiers survive Monviso avalanche",
            "A 75 minute fast paced performance that uniquely blends stand-up comedy",
            "2024-04-30T10:00:49.489Z",
            "2024-04-30T12:00:49.489Z"
        ),
    ],
};
