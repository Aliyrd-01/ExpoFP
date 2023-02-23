import React from "react";
import { Meta, Story } from "@storybook/react";
import Gallery, { GalleryProps } from "../Gallery/Gallery";

export default {
    title: "Components/Gallery",
    component: Gallery,
} as Meta;

const Template: Story<GalleryProps> = (args) => {
    return (
        <div className="layout sb-layout">
            <div className="sidebar">
                <Gallery {...args} />
            </div>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    images: [
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-Capture.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327233/media/316170713_5866732393386490_7382723422240955204_n.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-fkgdlfj.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327233/media/318585866_5911928238866905_8652592448164600146_n.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327144/media/original-Fj9Y3QMWQAIbn7n.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327144/media/original-Fj9Y3QNXkAIfnTF.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
        "https://demo.expofp.com/data/exhibitors/1327130/media/original-flghdlf.jpeg",
    ],
};
