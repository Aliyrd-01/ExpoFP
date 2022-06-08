import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import Button from "../Button";
import Modal from "../Modal";
import Share, { ShareProps } from "../Share";

export default {
    title: "Components/Share",
    component: Share,
} as Meta;

const Template: Story<ShareProps> = (args) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    return (
        <div className="sbContent">
            <Button text="Share" onClick={() => setModalOpen(true)} />
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
