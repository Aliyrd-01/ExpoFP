import React, { ReactNode } from "react";
import classNames from "classnames";
import "./Button.scss";

type targets = "_self" | "_blank" | "_parent";

export interface ButtonProps {
    children?: ReactNode;
    inline?: boolean;
    text?: string;
    link?: string;
    target?: targets;
    disabled?: boolean;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, inline = false, text, link, target = "_self", disabled = false, onClick }) => {
    return link ? (
        <a
            href={link}
            className={classNames("efp-button", { "efp-button--inline": inline })}
            target={target}
            rel="noopener noreferrer"
            onClick={onClick}
        >
            {children ? children : text}
        </a>
    ) : (
        <button
            type="button"
            className={classNames("efp-button", { "efp-button--inline": inline })}
            disabled={disabled}
            onClick={onClick}
        >
            {children ? children : text}
        </button>
    );
};

export default Button;
