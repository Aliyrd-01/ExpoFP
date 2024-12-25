import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import EntityItem from "../EntityItem";

const meta: Meta<typeof EntityItem> = {
    title: "Components/EntityItem",
    component: EntityItem,
};

export default meta;

type Story = StoryObj;

export const Base: Story = {
    render: () => (
        <aside className="sidebar">
            <div className="sb-entity-list">
                <EntityItem
                    id="42525"
                    url="/?aevo"
                    type="exhibitor"
                    title="AEVO Organic Avocado Cooking Oil"
                    image="https://loremflickr.com/80/80/avocado"
                    featured
                    additionalInfo={[
                        { type: "location", locationName: "A11105", hall: "A4", level: "1" },
                        { type: "location", locationName: "C350", hall: "C561", level: "2" },
                        { type: "location", locationName: "A4532", hall: "A4", level: "1" },
                    ]}
                />
            </div>
        </aside>
    ),
};

export const List: Story = {
    render: () => (
        <aside className="sidebar">
            <div className="sb-entity-list">
                <EntityItem
                    id="42525"
                    url="/?aevo"
                    type="exhibitor"
                    title="AEVO Organic Avocado Cooking Oil"
                    image="https://loremflickr.com/80/80/avocado"
                    featured
                    additionalInfo={[
                        { type: "location", locationName: "A11105", hall: "A4", level: "1" },
                        { type: "location", locationName: "C350", hall: "C561", level: "2" },
                        { type: "location", locationName: "A4532", hall: "A4", level: "1" },
                    ]}
                />
                <EntityItem
                    id="6431"
                    url="/?bored-cow"
                    type="exhibitor"
                    title="Bored Cow (Tomorrow Farms)"
                    image="https://loremflickr.com/120/80/cow"
                    additionalInfo={[{ type: "location", locationName: "A434", hall: "55", level: "3" }]}
                />
                <EntityItem
                    id="3535"
                    url="/?beyond"
                    type="exhibitor"
                    title="Beyond the Shell Nuts with T.M. Duche Nut Co."
                    image="https://loremflickr.com/100/120/nuts"
                    bookmarked
                    additionalInfo={[{ type: "location", locationName: "A454", hall: "55", level: "3" }]}
                />
                <EntityItem
                    id="852"
                    url="/?coffe-bar"
                    type="cafe"
                    title="Coffe bar"
                    image="https://loremflickr.com/160/90/coffee"
                    additionalInfo={[{ type: "location", locationName: "200", hall: "A44", level: "1" }]}
                />
                <EntityItem
                    id="76325"
                    url="/?innovations"
                    type="event"
                    date="24 Jun, Wed"
                    time="1:00 PM - 3:00 PM"
                    title="Innovations in Renewable Technology"
                    image="https://loremflickr.com/150/100/technology"
                    additionalInfo={[
                        { type: "location", locationName: "34234534", hall: "A1", level: "1" },
                        { type: "speaker", text: "Oprah Winfrey" },
                        { type: "speaker", text: "Emma Johnson" },
                    ]}
                />
                <EntityItem
                    id="88822"
                    url="/?cameron-williamson"
                    type="speaker"
                    image="https://picsum.photos/90/120"
                    title="Cameron Williamson"
                    subtitle="AI Research Scientist at OpenTech"
                    additionalInfo={[
                        { type: "event", text: "Future of Artificial Intelligence" },
                        { type: "event", text: "Cybersecurity Trends in 2025" },
                    ]}
                />
                <EntityItem
                    id="2543"
                    url="/?noah-miller"
                    type="speaker"
                    title="Noah Miller"
                    subtitle="CEO at DeFi Innovations"
                    additionalInfo={[{ type: "event", text: "Blockchain and Decentralized Finance" }]}
                />
                <EntityItem
                    id="765245"
                    url="/?a3454"
                    type="booth"
                    title="A3454"
                    additionalInfo={[{ type: "location", locationName: "3453", hall: "55", level: "3" }]}
                />
                <EntityItem id="8463" url="/?category-architecture" type="category" title="Architecture" itemsCount={25} />
            </div>
        </aside>
    ),
};
