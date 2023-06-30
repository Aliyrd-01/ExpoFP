import classNames from "classnames";
import { useObserver } from "mobx-react-lite";
import React, { MouseEvent, useEffect, useRef } from "react";
import data from "../data";
import store, { heatmapStore, uiState } from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import { t } from "../utils/i18n";
import BookmarkSvg from "./BookmarkSvg";
import "./ExhibitorRow.scss";
import { defaultRebookingOptions } from "./RebookingRadioGroup";

const ExhibitorRow: React.FC<{ exhibitor: Exhibitor; className: string }> = ({ exhibitor, className }) => {
    function handleClick(e: MouseEvent) {
        e.preventDefault();
        store.clickExhibitor(exhibitor);
    }

    function handleBookmark(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement) (document.activeElement as HTMLDivElement).blur();
        exhibitor.bookmarked = !exhibitor.bookmarked;
    }

    const div = useRef();

    useEffect(() => {
        if (!div.current) return;
        (div.current as HTMLAnchorElement).tabIndex = 0;
    }, [div]);

    const clicks = heatmapStore.getClicksByItem(exhibitor);
    const background = heatmapStore.getColorFromClickCount(clicks);
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
                    {exhibitor.name} {exhibitor.featured ? <i className="fas fa-gem" /> : null}
                </div>
            </div>
            {data.hideBookmarks || data.isRebooking || uiState.kiosk ? null : (
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
