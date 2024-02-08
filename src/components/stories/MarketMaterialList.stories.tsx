import React from "react";
import { Meta, Story } from "@storybook/react";
import MarketMaterialList, { MarketMaterialListProps } from "../MarketMaterialList/MarketMaterialList";

export default {
    title: "Conponents/MarketMaterialList",
    component: MarketMaterialList,
} as Meta;

const Template: Story<MarketMaterialListProps> = (args) => {
    return (
        <div className="map layout">
            <aside className="sidebar">
                <MarketMaterialList {...args} />
            </aside>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    list: [{
        fileName: 'About us presentation',
        path: 'https://s3-eu-west-1.amazonaws.com/bwh-website-uploads/uploads/2021/05/07101812/Security-Commitments-ASM-Global.pdf'
    }, {
        fileName: 'Logo',
        path: 'https://static.wikia.nocookie.net/logopedia/images/d/dd/ASM_Global.svg'
    }, {
        fileName: 'Transparent cover',
        path: 'https://cdn.saffire.com/images.ashx?t=ig&rid=ASMGlobal&i=asm-global-full-color(1).png'
    }],
};
