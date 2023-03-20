import React, { useEffect } from "react";
import { Meta, Story } from "@storybook/react";
import Gallery from "../Gallery/Gallery";

export default {
    title: "Components/Gallery",
    component: Gallery,
} as Meta;

const exhibitors = [
    "https://demo.expofp.com/data/exhibitors/1327257/media/original-292774227_1204942993640889_157754332075477676_n.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327257/media/original-301588456_1232427460892442_3300429707044882236_n.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327257/media/original-313368672_1280264259442095_6205607169115893365_n.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327261/media/original-360-view.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327261/media/original-data-trends.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327261/media/original-predictive_analytics.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327061/media/original-ByEventCycle.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327061/media/original-BySolution.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327061/media/original-ByStakeholder.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327061/media/original-ProductTree.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327144/media/original-Fj9Y3QMWQAIbn7n.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327144/media/original-Fj9Y3QNXkAIfnTF.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327130/media/original-Capture.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327233/media/316170713_5866732393386490_7382723422240955204_n.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327130/media/original-fkgdlfj.jpeg",
    "https://demo.expofp.com/data/exhibitors/1327233/media/318585866_5911928238866905_8652592448164600146_n.jpeg",
];

const examples = [
    "https://images.unsplash.com/photo-1608481337062-4093bf3ed404?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1476842384041-a57a4f124e2e?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1461301214746-1e109215d6d3?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1610448721566-47369c768e70?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1446630073557-fca43d580fbe?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1596370743446-6a7ef43a36f9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1605973029521-8154da591bd7?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1505820013142-f86a3439c5b2?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1539678050869-2b97c7c359fd?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1600&q=80",
];

const Template: any = (args) => {
    return (
        <div className="layout sb-layout">
            <div className="sidebar">
                <div>
                    <Gallery images={examples} />
                </div>
            </div>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {};
