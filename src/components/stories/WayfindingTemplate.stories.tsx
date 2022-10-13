import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import WayfindingTemplate, { WayfindingTemplateProps } from "../WayfindingTemplate";

export default {
    title: "Templates/Wayfinding",
    component: WayfindingTemplate,
} as Meta;

const Template: Story<WayfindingTemplateProps> = (args) => {
    const [from, setFrom] = useState(args.options[1].value);
    const [to, setTo] = useState(args.options[6].value);

    const getWayInformation = (distance) => {
        const info = [];
        const units = "m";
        const seconds = Math.round(distance / (units === "m" ? 1.4 : 4.2));
        let est = new Date();
        est.setMinutes(est.getMinutes() + seconds / 60);
        const estTotal = est.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        info.push(
            {
                title: "Travel time",
                text: seconds < 60 ? "< 1 min" : `~ ${Math.round(seconds / 60)} min`,
            },
            {
                title: "Distance",
                text: Math.round(distance) + ` ${units}`,
            },
            {
                title: "Est arrival",
                text: estTotal,
            }
        );

        return info;
    };

    const onChangeFrom = (val) => {
        setFrom(val);
        action("onChangeFrom")(val);
    };

    const onChangeTo = (val) => {
        setTo(val);
        action("onChangeTo")(val);
    };

    const onSwitch = () => {
        setFrom(to);
        setTo(from);
        action("onSwitch")(true);
    };

    return (
        <div className="map layout">
            <aside className="sidebar">
                <WayfindingTemplate
                    {...args}
                    fromValue={from}
                    toValue={to}
                    onChangeFrom={onChangeFrom}
                    onChangeTo={onChangeTo}
                    infoItems={getWayInformation(400)}
                    onClickInfo={() => action("onClickInfo")(true)}
                    onSwitch={onSwitch}
                />

                <div className="sb-data">
                    <strong>From-To:</strong>
                    {from ? from : "undefined"} - {to ? to : "undefined"}
                </div>
            </aside>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    options: [
        {
            value: "4241",
            label: "42Chat",
        },
        {
            value: "6243",
            label: "Airways Freight Corporation",
        },
        {
            value: "434",
            label: "American Tradeshow Services LLC",
        },
        {
            value: "442",
            label: "ASM Global",
        },
        {
            value: "25442",
            label: "Austin Convention Center",
        },
        {
            value: "854",
            label: "Boomer Commerce",
        },
        {
            value: "65",
            label: "CadmiumCD",
        },
        {
            value: "y635",
            label: "Choose Chicago",
        },
        {
            value: "6353",
            label: "CompuSystems, Inc.",
        },
        {
            value: "6455",
            label: "Corporate Events New England",
        },
    ],
    showInfo: true,
    routeFound: true,
};
