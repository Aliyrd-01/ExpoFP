import React, { Fragment } from "react";
import { uiState } from "../store";

const HighlightText = ({ text }) => {
    if (uiState.list.type !== "search" || !uiState.list.text) {
        return <>{text}</>
    };

    const escapedText = uiState.list.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(escapedText, "gi");
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => (
                <Fragment key={index}>
                    {part}
                    {index < parts.length - 1 && <mark>{text.match(regex)[index]}</mark>}
                </Fragment>
            ))}
        </>
    );
};

export default HighlightText;
