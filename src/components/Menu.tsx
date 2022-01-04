import copyToClipboard from "copy-to-clipboard";
import { VisibilityProperty } from "csstype";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { MouseEvent } from "react";
import data from "../data";
import store, { categoryStore, exhibitorStore, uiState } from "../store";
import { Category } from "../store/CategoryStore";
import baseUrl from "../tools/base-data-url";
import logger from "../tools/logger";
import { t } from "../utils/i18n";
import isIframe from "../utils/is-iframe";
import { useAutorun } from "../utils/mobx";
import "./Menu.scss";
import OverlayContent from "./OverlayContent";

const logoUrl = baseUrl + data.logo;
logger.log("Logo url: ", logoUrl);

window.setTimeout(function () {
    const img = new Image();
    img.onload = () => {
        logger.log("Logo image loaded");
    };
    img.src = logoUrl;

    // const link = document.createElement("link");
    // link.href = logoUrl;
    // link.rel = "preload";
    // (link as any).as = "image";
    // document.head.appendChild(link);
}, 1500);

function Menu() {
    const s = useLocalStore(() => ({
        logoVisibility: "visible" as VisibilityProperty,
        shown: false,
        shownTimeout: undefined as number,
    }));

    useAutorun(() => {
        if (!uiState.menu) {
            s.shown = false;
            if (s.shownTimeout) window.clearTimeout(s.shownTimeout);
        } else {
            s.shownTimeout = window.setTimeout(() => (s.shown = true), 1);
        }
    });

    function handleClick(e) {
        if (uiState.kiosk) return e.preventDefault();
    }

    const barContent = isIframe ? (
        <div className="menu__bar -empty"></div>
    ) : (
        <div className="menu__bar">
            <a className="menu__title" href={data.homeUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
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
            <div className="menu__item">{t("Categories")}</div>
            {categoryStore.categories.map((c) => (
                <a
                    className="menu__cat"
                    href={`?${encodeURIComponent(c.slug)}`}
                    key={c.id}
                    onClick={handleCategoryClick.bind(window, c)}
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
                    <a href="/#" onClick={handleSearch} className="menu__item">
                        {t("Search")}
                    </a>
                    {!data.hideEventHomeLink && !uiState.kiosk && !isIframe && !!data.homeUrl && (
                        <a href={data.homeUrl} target="_blank" className="menu__item" rel="noopener noreferrer">
                            {t("Event Home").replace(/ /g, "\u00A0")}&nbsp;
                            <i className="fas fa-external-link" />
                        </a>
                    )}
                    {!data.hideRegisterToAttendLink && !uiState.kiosk && !isIframe && !!data.registerUrl && (
                        <a href={data.registerUrl} target="_blank" className="menu__item" rel="noopener noreferrer">
                            {t("Register to Attend").replace(/ /g, "\u00A0")}&nbsp;
                            <i className="fas fa-external-link" />
                        </a>
                    )}
                    {!data.hideBookmarksLink && !uiState.kiosk && exhibitorStore.exhibitors.length > 0 && (
                        <a href="?bookmarks" onClick={handleBookmarks} className="menu__item -bookmarks">
                            <span>
                                {t("Bookmarks")} <span>({exhibitorStore.bookmarked.length})</span>
                            </span>
                            {exhibitorStore.bookmarked.length ? (
                                <button onClick={shareBookmarks} className="fas fa-share-square" title={t("Share bookmarks")} />
                            ) : null}
                        </a>
                    )}
                    {!data.hideDownloadPdfLink && !uiState.kiosk && (
                        <a href="/?-pdf" className="menu__item -pdf" onClick={handlePdf}>
                            {t("Download PDF")}
                        </a>
                    )}

                    {!data.hideCategoriesLink && categories}
                </div>
            </OverlayContent>
        );
    });

    function shareBookmarks(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        (e.target as HTMLButtonElement).blur();
        const loc = window.location;
        const url = `${loc.protocol}//${loc.host}/?b=` + exhibitorStore.bookmarked.map((x) => x.id).join("|");
        copyToClipboard(url);
        alert(t("Link copied to clipboard.\nOpen it on another device to import bookmarks."));
    }

    function close() {
        uiState.menu = false;
    }

    function numOfExhibitors(id: number) {
        return exhibitorStore.exhibitors.filter((e) => e.categories.find((c) => c.id === id)).length;
    }

    function handleSearch(e: MouseEvent) {
        e.preventDefault();
        close();
        store.selectSearch();
        window.setTimeout(() => {
            uiState.searchFocused = true;
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

    function handleCategoryClick(c: Category, e: MouseEvent) {
        e.preventDefault();
        store.clickCategory(c);
    }
}

export default () => useObserver(() => <>{uiState.menu ? <Menu /> : null}</>);
