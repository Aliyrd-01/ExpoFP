import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Modal, { ModalProps } from "../Modal";
import Button from "../Button";

export default {
    title: "Components/Modal",
    component: Modal,
} as Meta;

const Template: Story<ModalProps> = (args) => {
    const [isOpen, setIsOpen] = useState<boolean>(args.open);

    const clickClose = () => {
        setIsOpen(false);
        action("onClickClose")(true);
    };

    return (
        <>
            <Button text="Open modal" onClick={() => setIsOpen(true)} />
            <Modal {...args} open={isOpen} onClickClose={clickClose}>
                While Earth is only the fifth largest planet in the solar system, it is the only world in our solar system with
                liquid water on the surface. Just slightly larger than nearby Venus, Earth is the biggest of the four planets
                closest to the Sun, all of which are made of rock and metal.
            </Modal>
        </>
    );
};

export const Base = Template.bind({});
Base.args = {
    open: false,
};
