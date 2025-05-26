import React from "react";
import { observer } from "mobx-react-lite";
import { uiState } from "../store";

const HighlightText = observer(({ text }: { text: string }) => {
    if (uiState.list.type !== "search" || !uiState.list.text) {
        return <>{text}</>;
    }

    const searchQuery = uiState.list.text;
    // Find the maximum length of the coinciding beginning
    let matchLength = 0;
    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();

    while (
        matchLength < searchQuery.length &&
        matchLength < text.length &&
        lowerText[matchLength] === lowerQuery[matchLength]
    ) {
        matchLength++;
    }

    if (matchLength === 0) {
        return <>{text}</>;
    }

    // Take the original substring (preserving case)
    const matchedPart = text.slice(0, matchLength);
    const remainingPart = text.slice(matchLength);

    return (
        <>
            <mark>{matchedPart}</mark>
            {remainingPart}
        </>
    );
});

export default HighlightText;
