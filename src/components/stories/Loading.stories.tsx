import React, { useEffect, useState } from "react";
import { Meta, Story } from "@storybook/react";
import LayersLoading from "../LayersLoading";

export default {
    title: "Components/LayersLoading",
    component: LayersLoading,
} as Meta;

const Template: Story = (args) => {
    const [loadingActive, setLoadingActive] = useState<boolean>(false);

    useEffect(() => {
        const startLoading = setTimeout(() => {
            setLoadingActive(true);
        }, 3000);
        const endLoading = setTimeout(() => {
            setLoadingActive(false);
        }, 9000);

        return () => {
            clearTimeout(startLoading);
            clearTimeout(endLoading);
        };
    }, []);

    return (
        <>
            <iframe src="https://canneslions2023.expofp.com/" className="sb-iframe" title="test"></iframe>
            <LayersLoading active={loadingActive} />
        </>
    );
};

export const Base = Template.bind({});
