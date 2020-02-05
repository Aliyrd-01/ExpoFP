import classNames from "classnames";
import { useObserver } from "mobx-react-lite";
import React, { MouseEvent, useEffect, useRef } from "react";
// import store, { uiState } from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import BookmarkSvg from "./BookmarkSvg";
import "./ExhibitorRow.scss";
import { useStore, useUiState, useExhibitorStore } from "../tools/use";
import { RegularBooth } from "../core/Booth";

const ExhibitorRow: React.FC<{ exhibitor: Exhibitor; className: string }> = ({ exhibitor, className }) => {
    const store = useStore();
    const uiState = useUiState();
    const exhibitorStore = useExhibitorStore();

    function handleClick(e: MouseEvent) {
        e.preventDefault();
        store.clickExhibitor(exhibitor);
    }

    function handleBookmark(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement) (document.activeElement as HTMLDivElement).blur();
        store.toggleExhibitorBookmark(exhibitor);
        // if (exhibitor.bookmarked) {
        //     exhibitorStore.bookmarked.delete(exhibitor.id);
        // } else {
        //     exhibitorStore.bookmarked.add(exhibitor.id);
        // }

        //exhibitor.bookmarked = !exhibitor.bookmarked;
    }

    const div = useRef();

    useEffect(() => {
        (div.current as HTMLAnchorElement).tabIndex = 0;
    }, [div]);

    return useObserver(() => (
        <a
            className={`exhibitor-row ${className} ${classNames({
                bookmarked: exhibitor.bookmarked,
                featured: exhibitor.featured
            })}`}
            onMouseOver={() => (uiState.hoveredExhibitor = exhibitor)}
            onMouseOut={() => (uiState.hoveredExhibitor = null)}
            href={`?${exhibitor.slug}`}
            onClick={handleClick}
        >
            <div className="exhibitor-row__lines">
                {exhibitor.name} {exhibitor.featured ? <i className="fas fa-gem" /> : null}
            </div>
            <div className="exhibitor-row__bookmark" onClick={handleBookmark} title="Toggle bookmark" ref={div}>
                <BookmarkSvg />
            </div>
            <div className="exhibitor-row__booth">
                {exhibitor.booths.map((booth: RegularBooth) => (
                    <div key={booth.name}>{booth.name}</div>
                ))}
            </div>
        </a>
    ));
};

export default ExhibitorRow;
