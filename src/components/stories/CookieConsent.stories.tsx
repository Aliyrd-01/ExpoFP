import React, { useState } from "react";
import { action } from "@storybook/addon-actions";
import { Meta, StoryFn } from "@storybook/react";
import CookieConsent from "../CookieConsent";

export default {
    title: "Components/CookieConsent",
    component: CookieConsent,
} as Meta;

const Template: StoryFn = (args) => {
    const [showCookieConsent, setShowCookieConsent] = useState<Boolean>(true);
    const cookieHandler = (chosen) => {
        setShowCookieConsent(false);
        action(chosen ? "onClickAccept" : "onClickReject")(true);
    };

    return (
        <>
            <iframe src="https://canneslions2023.expofp.com/" className="sb-iframe" title="test"></iframe>
            {showCookieConsent ? (
                <CookieConsent {...args} onClickAccept={() => cookieHandler(true)} onClickReject={() => cookieHandler(false)} />
            ) : null}
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    link: "https://expofp.com",
};
