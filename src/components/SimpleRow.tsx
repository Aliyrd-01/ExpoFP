import React from "react";
import data from "../data";
import "./SimpleRow.scss";
import HighlightText from "./HighlightText";

const SimpleRow: React.FC<{
    line1: string;
    line2: string;
    lineEnd?: string;
    slug: string;
    active?: boolean;
    className: string;
    style?: React.CSSProperties;
    onClick: () => void;
    onMouseOver?: () => void;
    onMouseOut?: () => void;
    highlight?: boolean;
}> = ({ line1, line2, lineEnd, slug, style, className, active = false, onClick, onMouseOver, onMouseOut, highlight = true }) => {
    return (
        <a
            href={"?" + encodeURIComponent(slug)}
            onClick={handleClick}
            className={"efp-simple-row" + (active ? " active" : "") + " " + className}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            style={{ marginLeft: data.isRebooking ? `5px` : null, ...style }}
        >
            <div className="efp-simple-row__col">
                <div className="efp-simple-row__main" dir="auto">
                    {highlight ? <HighlightText text={line1} /> : line1}
                </div>
                <div className="efp-simple-row__sub" dir="auto">
                    {line2}
                </div>
            </div>
            {lineEnd && <div className="efp-simple-row__end">{lineEnd}</div>}
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
