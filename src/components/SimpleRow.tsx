import React from "react";
import './SimpleRow.scss';

const SimpleRow: React.FC<{
    line1: string;
    line2: string;
    slug: string;
    active: boolean;
    onClick: () => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}> = ({ line1, line2, slug, active, onClick, onMouseOver, onMouseOut }) => {
    return (
        <a
            href={"?" + encodeURIComponent(slug)}
            onClick={handleClick}
            className={"simple-row" + (active && " active")}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            <div className="simple-row__main">{{ line1 }}</div>
            <div className="simple-row__sub">{{ line2 }}</div>
        </a>
    );

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        onClick();
    }
    function handleMouseOver() {
        onMouseOver && onMouseOver();
    }
    function handleMouseOut() {
        onMouseOut && onMouseOut();
    }
};

export default SimpleRow;