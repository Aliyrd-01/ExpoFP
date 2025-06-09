import React, { useContext, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Modal, { ModalProps } from "../Modal";
import Button from "../Button";
import ResponsiveClassContext from "../../storybook/contexts/ResponsiveClassContext";

export default {
    title: "Components/Modal",
    component: Modal,
    parameters: {
        usePadding: true,
    },
} as Meta;

const Template: StoryFn<ModalProps> = (args) => {
    const [isOpen, setIsOpen] = useState<boolean>(args.open);
    const responsiveClass = useContext(ResponsiveClassContext);

    const clickClose = () => {
        setIsOpen(false);
        action("onClickClose")(true);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Open modal</Button>
            <Modal {...args} className={responsiveClass} open={isOpen} onClickClose={clickClose}>
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
