import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import Button from "../Button";
import Modal from "../Modal";
import Share, { ShareProps } from "../Share";

export default {
    title: "Components/Share",
    component: Share,
} as Meta;

const Template: StoryFn<ShareProps> = (args) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    return (
        <div className="layout sb-layout">
            <Button onClick={() => setModalOpen(true)}>Share</Button>
            <Modal type="share" open={modalOpen} onClickClose={() => setModalOpen(false)}>
                <Share {...args} />
            </Modal>
        </div>
    );
};

export const Base = Template.bind({});
Base.args = {
    title: "4imprint",
    url: "https://demo.expofp.com/?4imprint",
};
