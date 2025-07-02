import React, { Fragment } from "react";
import { observer } from "mobx-react-lite";

import { uiState } from "../store";

const HighlightText = observer(({ text }: { text: string }) => {
    if (uiState.list.type !== "search" || !uiState.list.text) {
        return <>{text}</>;
    }

    const escapedText = uiState.list.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(escapedText, "gi");
    const parts = text.split(regex);
    const matches = text.match(regex);

    if (!matches) {
        return <>{text}</>;
    }

    return (
        <>
            {parts.map((part, index) => (
                <Fragment key={index}>
                    {part}
                    {index < matches.length && <mark>{matches[index]}</mark>}
                </Fragment>
            ))}
        </>
    );
});

export default HighlightText;
