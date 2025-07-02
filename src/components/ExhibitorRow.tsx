import React, { MouseEvent, useEffect, useRef } from "react";
import classNames from "classnames";
import { useObserver } from "mobx-react-lite";

import data from "../data";
import store, { uiState } from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import { t } from "../utils/i18n";
import useHeatmapData from "../utils/useHeatmapData";

import { BookmarkSvg, HighlightText } from "./";
import { defaultRebookingOptions } from "./RebookingRadioGroup";

import "./ExhibitorRow.scss";

const ExhibitorRow: React.FC<{ exhibitor: Exhibitor; className: string }> = ({ exhibitor, className }) => {
    const { clicks, background } = useHeatmapData(exhibitor);

    function handleClick(e: MouseEvent) {
        e.preventDefault();
        store.clickExhibitor(exhibitor);
    }

    function handleBookmark(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement) (document.activeElement as HTMLDivElement).blur();
        exhibitor.bookmarked = !exhibitor.bookmarked;
        if (uiState.onBookmarkClick)
            uiState.onBookmarkClick({ name: exhibitor.name, bookmarked: exhibitor.bookmarked, externalId: exhibitor.externalId });
    }

    const div = useRef();

    useEffect(() => {
        if (!div.current) return;
        (div.current as HTMLAnchorElement).tabIndex = 0;
    }, [div]);

    return useObserver(() => (
        <a
            className={`exhibitor-row ${className} ${classNames({
                bookmarked: exhibitor.bookmarked,
                featured: exhibitor.featured,
            })}`}
            style={{
                borderLeft: data.isRebooking
                    ? `5px solid ${defaultRebookingOptions[exhibitor.rebookingState].color.primary}`
                    : null,
                background: uiState.heatmap
                    ? `linear-gradient(to right, transparent 98%, ${background} 93%) center / 100% 99% no-repeat`
                    : null,
            }}
            onMouseOver={() => (uiState.hoveredExhibitor = exhibitor)}
            onMouseOut={() => (uiState.hoveredExhibitor = null)}
            href={`?${exhibitor.slug}`}
            onClick={handleClick}
        >
            <div className={classNames("exhibitor-row__lines")}>
                <div dir="auto">
                    <HighlightText text={exhibitor.name} /> {exhibitor.featured ? <i className="icon-diamond" /> : null}
                </div>
            </div>
            {uiState.disableBookmarked || data.hideBookmarks || data.isRebooking || uiState.kiosk ? null : (
                <div className="exhibitor-row__bookmark" onClick={handleBookmark} title={t("Toggle bookmark")} ref={div}>
                    <BookmarkSvg />
                </div>
            )}
            <div className="exhibitor-row__info">
                {uiState.heatmap ? clicks : exhibitor.booths.map((booth) => <div key={booth.id}>{booth.fullName}</div>)}
            </div>
        </a>
    ));
};

export default ExhibitorRow;
