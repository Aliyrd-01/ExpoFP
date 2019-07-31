import copyToClipboard from "copy-to-clipboard";
import { VisibilityProperty } from "csstype";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { MouseEvent } from "react";
import data from "../data";
import store, { categoryStore, exhibitorStore, uiState } from "../store";
import baseUrl from "../tools/base-data-url";
import { useAutorun } from "../utils/mobx";
import "./Menu.scss";
import OverlayContent from "./OverlayContent";

const logoUrl = baseUrl + data.logo;

window.setTimeout(function() {
    const link = document.createElement("link");
    link.href = logoUrl;
    link.rel = "preload";
    (link as any).as = "image";
    document.head.appendChild(link);
}, 4000);

function Menu() {
    const s = useLocalStore(() => ({
        logoVisibility: "visible" as VisibilityProperty,
        shown: false,
        shownTimeout: undefined as number
    }));

    useAutorun(() => {
        if (!uiState.menu) {
            s.shown = false;
            if (s.shownTimeout) window.clearTimeout(s.shownTimeout);
        } else {
            s.shownTimeout = window.setTimeout(() => (s.shown = true), 1);
        }
    });

    const barContent = (
        <div className="menu__bar">
            <a className="menu__title" href={data.homeUrl} target="_blank" rel="noopener noreferrer">
                <img
                    src={logoUrl}
                    onError={() => (s.logoVisibility = "hidden")}
                    style={{ visibility: s.logoVisibility }}
                    alt=""
                />
            </a>
        </div>
    );

    const categories = categoryStore.categories.length ? (
        <>
            <div className="menu__item">Categories</div>
            {categoryStore.categories.map(c => (
                <a
                    className="menu__cat"
                    href={`?${encodeURIComponent(c.slug)}`}
                    key={c.id}
                    onClick={handleCategory.bind(window, c.id)}
                >
                    <div className="menu__cat-bullet">&bull;</div>
                    <div className="menu__cat-title">{c.name}</div>
                    <div className="menu__cat-count">{numOfExhibitors(c.id)}</div>
                </a>
            ))}
        </>
    ) : null;

    // TODO: replace a href="/#" with buttons everywhere
    return useObserver(() => {
        if (!uiState.menu) return null;

        return (
            <OverlayContent
                className={`menu ${s.shown ? "shown" : ""}`}
                bar={barContent}
                onClose={close}
                onBack={close}
                backMode="none"
            >
                <div className="menu__content">
                    <a href={data.homeUrl} target="_blank" className="menu__item" rel="noopener noreferrer">
                        <i className="fas fa-home" /> Event&nbsp;Home&nbsp;
                        <i className="fas fa-external-link" />
                    </a>
                    <a href="/#" onClick={handleSearch} className="menu__item">
                        <i className="fas fa-search" /> Search
                    </a>
                    <a href="?bookmarks" onClick={handleBookmarks} className="menu__item -bookmarks">
                        <i className="fas fa-bookmark" />
                        <span>Bookmarks ({exhibitorStore.bookmarked.length})</span>
                        {exhibitorStore.bookmarked.length ? (
                            <button onClick={shareBookmarks} className="fas fa-share-square" title="Share bookmarks" />
                        ) : null}
                    </a>
                    <a href="/#" className="menu__item -pdf" onClick={handlePdf}>
                        <i className="fas fa-file-pdf" /> Download PDF
                    </a>
                    {categories}
                </div>
            </OverlayContent>
        );
    });

    function shareBookmarks(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        (e.target as HTMLButtonElement).blur();
        const loc = window.location;
        const url = `${loc.protocol}//${loc.host}/?b=` + exhibitorStore.bookmarked.map(x => x.id).join("|");
        copyToClipboard(url);
        alert("Link copied to clipboard.\nOpen it on another device to import bookmarks.");
    }

    function close() {
        uiState.menu = false;
    }

    function numOfExhibitors(id: number) {
        return exhibitorStore.exhibitors.filter(e => e.categories.find(c => c.id === id)).length;
    }

    function handleSearch(e: MouseEvent) {
        e.preventDefault();
        close();
        store.selectSearch();
        window.setTimeout(() => {
            store.setSearchFocused(true);
        }, 1);
    }

    function handleBookmarks(e: MouseEvent) {
        e.preventDefault();
        store.clickBookmarks();
        store.moveToList();
    }

    function handlePdf(e: MouseEvent) {
        e.preventDefault();
        uiState.printingPdf = true;
    }

    function handleCategory(id: number, e: MouseEvent) {
        e.preventDefault();
        store.clickCategory(id);
    }
}

export default Menu;
