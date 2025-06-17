import React, { MouseEvent } from "react";
import { useLocalStore, useObserver } from "mobx-react-lite";
import { autorun } from "mobx";
import { t } from "../utils/i18n";
import data from "../data";
import baseUrl from "../tools/base-data-url";
import isIframe from "../utils/is-iframe";
import copyToClipboard from "copy-to-clipboard";
import store, { categoryStore, exhibitorStore, uiState } from "../store";
import OverlayContent from "./OverlayContent";
import Badge from "./Badge";
import { CategoryFilterModal } from "./CategoryFilterModal";
import * as CSS from "csstype";
import logger from "../tools/logger";
import settings from "../tools/settings";
import "./Menu.scss";
import "./Menu_custom.scss";

const logoUrl = /^https?:\/\//i.test(data.logo) ? data.logo : baseUrl + data.logo;
logger.log("Logo url: ", logoUrl);

window.setTimeout(function () {
    const img = new Image();
    img.onload = () => {
        logger.log("Logo image loaded");
    };
    img.crossOrigin = "anonymous";
    img.src = logoUrl;

    // const link = document.createElement("link");
    // link.href = logoUrl;
    // link.rel = "preload";
    // (link as any).as = "image";
    // document.head.appendChild(link);
}, 1500);

interface MenuProps {
    isGDPR: boolean;
    allowConsent?: boolean;
}

function Menu({ allowConsent, isGDPR }: MenuProps) {
    const s = useLocalStore(() => ({
        logoVisibility: "visible" as CSS.Property.Visibility,
        shown: false,
        shownTimeout: undefined as number,
        modalOpen: false,
        selectedCategoryIds: (uiState.selectedCategoryFilters || []).map((c) => Number(c.id)),
        pendingSelectedIds: (uiState.selectedCategoryFilters || []).map((c) => Number(c.id)),
    }));

    autorun(() => {
        if (!uiState.menu) {
            s.shown = false;
            if (s.shownTimeout) window.clearTimeout(s.shownTimeout);
        } else {
            s.shownTimeout = window.setTimeout(() => (s.shown = true), 1);

            if (uiState.list.type === "agenda") {
                store.selectSearch();
            }
        }
    });

    function handleClick(e) {
        if (uiState.kiosk) return e.preventDefault();
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

    function shareBookmarks(e: MouseEvent) {
        e.preventDefault();
        close();
        const loc = window.location;
        const url = `${loc.protocol}//${loc.host}/?b=` + exhibitorStore.bookmarked.map((x) => x.id).join("|");
        copyToClipboard(url);
        alert(t("Link copied to clipboard") + ".\n" + t("Open it on another device to import bookmarks") + ".");
    }

    function handleLanguage(e: MouseEvent) {
        e.preventDefault();
        store.clickLanguage();
    }

    const handleAgendaClick = (e: MouseEvent) => {
        e.preventDefault();
        store.selectAgenda();
    };

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
                    crossOrigin="anonymous"
                />
            </a>
        </div>
    );

    const cats = categoryStore.categories.filter((c) => c.exhibitors.length);

    const handleFilterClick = (e: MouseEvent) => {
        e.preventDefault();
        store.categoryFilterStore.openFilter();
    };

    return useObserver(() => {
        if (!uiState.menu) return null;

        const bookmarks = (store.boothStore.booths as any).filter((b: any) => b.bookmarked).map((b: any) => b.name) as string[];
        const hasEvents = store.eventStore.eventItems.length > 0;

        return (
            <>
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
                        {cats.length ? (
                            <a className="menu__item -categories" href="/#" onClick={handleFilterClick}>
                                <span>{t("Categories")}</span>
                                <span className="menu__icons">
                                    {store.categoryFilterStore.state.selectedItems.length > 0 && (
                                        <Badge variant="gray" size="md" noMargins rounded>
                                            {store.categoryFilterStore.state.selectedItems.length}
                                        </Badge>
                                    )}
                                    <i className="icon-chevron-right" />
                                </span>
                            </a>
                        ) : null}
                        {hasEvents && (
                            <a className="menu__item -agenda" href="/#" onClick={handleAgendaClick}>
                                <span>{t("Agenda")}</span>
                                <span className="menu__icons">
                                    <i className="icon-chevron-right" />
                                </span>
                            </a>
                        )}
                        {!data.hideEventHomeLink && !uiState.kiosk && !isIframe && !!data.homeUrl && (
                            <a href={data.homeUrl} target="_blank" className="menu__item" rel="noopener noreferrer">
                                {t("Event Home").replace(/ /g, "\u00A0")}&nbsp;
                                <i className="icon-link-external" />
                            </a>
                        )}
                        {!data.hideRegisterToAttendLink && !uiState.kiosk && !isIframe && !!data.registerUrl && (
                            <a href={data.registerUrl} target="_blank" className="menu__item" rel="noopener noreferrer">
                                {t("Register to Attend").replace(/ /g, "\u00A0")}&nbsp;
                                <i className="icon-link-external" />
                            </a>
                        )}
                        {!uiState.disableBookmarked &&
                            !data.hideBookmarks &&
                            !data.hideBookmarksLink &&
                            !uiState.kiosk &&
                            exhibitorStore.exhibitors.length > 0 && (
                                <a href="?bookmarks" onClick={handleBookmarks} className="menu__item -bookmarks">
                                    <span>
                                        {t("Bookmarks")}{" "}
                                        <span>({exhibitorStore.exhibitors.filter((e) => e.bookmarked).length})</span>
                                    </span>

                                    <span className="menu__icons">
                                        {exhibitorStore.bookmarked.length ? (
                                            <button onClick={shareBookmarks} title={t("Share bookmarks")}>
                                                <i className="icon-link-external-solid"></i>
                                            </button>
                                        ) : null}
                                        <i className="icon-chevron-right" />
                                    </span>
                                </a>
                            )}
                        {!uiState.hideLanguage && !data.hideLanguage && !data.hideLanguageLink && (
                            <a href="?language" onClick={handleLanguage} className="menu__item -language">
                                <span>{t("Language")} </span>
                                <span className="menu__icons">
                                    <Badge variant="gray" size="md" noMargins>
                                        {store.languageStore.language?.name}
                                    </Badge>
                                    <i className="icon-chevron-right" />
                                </span>
                            </a>
                        )}
                        {!data.hideDownloadPdfLink && !uiState.kiosk && (
                            // <a href="/?-pdf" className="menu__item -pdf" onClick={handlePdf}>
                            //     {t("Download PDF")}
                            // </a>
                            <a
                                className="menu__item -pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://api.expofp.com/service/convert/${settings.EXPO}/pdf/?bookmarks=${bookmarks.join(
                                    ","
                                )}&layers=${(store.layerStore.layers.length >= store.layerStore.visible.length
                                    ? store.layerStore.visible.map((l) => l.name).join(",")
                                    : ""
                                ).replace(/&/g, "%26")}`}
                            >
                                {t("Download PDF")}
                            </a>
                        )}
                        {allowConsent === undefined && isGDPR && (
                            <a
                                href="/#"
                                className="menu__item -cookie-consent"
                                onClick={(e) => {
                                    e.preventDefault();
                                    uiState.hideCookieConsent = false;
                                }}
                            >
                                {t("Review Cookie Consent")}
                            </a>
                        )}
                    </div>
                </OverlayContent>
                <CategoryFilterModal />
            </>
        );
    });

    function close() {
        uiState.menu = false;
    }
}

export default ({ isGDPR, allowConsent }: MenuProps) =>
    useObserver(() => <>{uiState.menu ? <Menu isGDPR={isGDPR} allowConsent={allowConsent} /> : null}</>);
