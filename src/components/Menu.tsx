import copyToClipboard from "copy-to-clipboard";
import * as CSS from "csstype";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { MouseEvent } from "react";
import data from "../data";
import store, { categoryStore, exhibitorStore, uiState } from "../store";
import { Category } from "../store/CategoryStore";
import baseUrl from "../tools/base-data-url";
import logger from "../tools/logger";
import settings from "../tools/settings";
import { t } from "../utils/i18n";
import isIframe from "../utils/is-iframe";
import { useAutorun } from "../utils/mobx";
import "./Menu.scss";
import "./Menu_custom.scss";
import OverlayContent from "./OverlayContent";
import Badge from "./Badge";
import Modal from "./Modal";
import MultiSelectGroups, { MultiSelectGroup, MultiSelectGroupItem } from "./MultiSelectGroups";

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
                    crossOrigin="anonymous"
                />
            </a>
        </div>
    );

    const cats = categoryStore.categories.filter((c) => c.exhibitors.length);

    const groups: MultiSelectGroup[] = React.useMemo(() => {
        const cats = store.categoryStore.categories || [];
        const grouped: Record<string, MultiSelectGroup> = {};
        const ungroupedItems: MultiSelectGroupItem[] = [];

        cats.forEach((cat) => {
            if (!cat || !cat.exhibitors || cat.exhibitors.length === 0) return;

            const parts = (cat.name || "").split("/").map((p) => p.trim());

            if (parts.length > 1) {
                const groupName = parts[0];
                const itemName = parts.slice(1).join(" / ");

                if (!grouped[groupName]) {
                    grouped[groupName] = { groupName, items: [] };
                }

                grouped[groupName].items.push({ id: cat.id, name: itemName });
            } else {
                ungroupedItems.push({ id: cat.id, name: cat.name });
            }
        });

        const result: MultiSelectGroup[] = [];

        if (ungroupedItems.length > 0) {
            result.push({
                groupName: "General",
                items: ungroupedItems,
            });
        }

        Object.values(grouped).forEach((group) => {
            if (group.items && group.items.length > 0) {
                result.push(group);
            }
        });

        return result;
    }, [store.categoryStore.categories]);

    const handleFilterClick = (e: MouseEvent) => {
        e.preventDefault();
        s.pendingSelectedIds = s.selectedCategoryIds;
        s.modalOpen = true;
    };

    const handleModalClose = () => {
        s.modalOpen = false;
    };

    const handleReset = () => {
        s.pendingSelectedIds = [];
    };

    const handleApply = () => {
        s.selectedCategoryIds = s.pendingSelectedIds;
        const selected = store.categoryStore.categories.filter((c) => s.pendingSelectedIds.includes(Number(c.id)));
        uiState.setSelectedCategoryFilters(selected || []);
        uiState.categoryFilterOpen = true;
        s.modalOpen = false;
        close();
    };

    const handleCancel = () => {
        s.pendingSelectedIds = [...s.selectedCategoryIds];
        s.modalOpen = false;
    };

    const isShowResultsEnabled = () => {
        return s.modalOpen;
    };

    const getTotalExhibitorsCount = () => {
        const selectedCategories = store.categoryStore.categories.filter((c) => s.pendingSelectedIds.includes(Number(c.id)));
        const exhibitorIds = new Set();
        selectedCategories.forEach((category) => {
            category.exhibitors.forEach((exhibitor) => {
                exhibitorIds.add(exhibitor.id);
            });
        });
        return exhibitorIds.size;
    };

    return useObserver(() => {
        if (!uiState.menu) return null;

        const bookmarks = (store.boothStore.booths as any).filter((b: any) => b.bookmarked).map((b: any) => b.name) as string[];

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
                    {cats.length ? (
                        <a className="menu__item -categories" href="/#" onClick={handleFilterClick}>
                            <span>{t("Categories")}</span>
                            <span className="menu__icons">
                                {s.selectedCategoryIds.length > 0 && (
                                    <Badge variant="gray" size="md" noMargins rounded>
                                        {s.selectedCategoryIds.length}
                                    </Badge>
                                )}
                                <i className="icon-chevron-right" />
                            </span>
                        </a>
                    ) : null}
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
                                    {t("Bookmarks")} <span>({exhibitorStore.exhibitors.filter((e) => e.bookmarked).length})</span>
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
                {s.modalOpen && (
                    <Modal
                        open={s.modalOpen}
                        title={t("Filter Exhibitors by Categories")}
                        badge={s.pendingSelectedIds.length > 0 ? s.pendingSelectedIds.length : undefined}
                        onClickClose={handleModalClose}
                        footerLeft={
                            s.pendingSelectedIds.length > 0
                                ? [{ label: t("Clear All Selections"), onClick: handleReset, variant: "gray" }]
                                : []
                        }
                        footerRight={[
                            {
                                label:
                                    s.pendingSelectedIds.length > 0
                                        ? `Show #${getTotalExhibitorsCount()}# Matching Exhibitors`
                                        : t("Show All Exhibitors"),
                                onClick: handleApply,
                                variant: "primary",
                                withBadge: true,
                                disabled: !isShowResultsEnabled(),
                            },
                        ]}
                    >
                        <MultiSelectGroups
                            groups={groups}
                            selectedIds={s.pendingSelectedIds}
                            onChange={(ids) => (s.pendingSelectedIds = ids.map(Number))}
                        />
                    </Modal>
                )}
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
        alert(t("Link copied to clipboard") + ".\n" + t("Open it on another device to import bookmarks") + ".");
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

    function handleLanguage(e: MouseEvent) {
        e.preventDefault();
        store.clickLanguage();
    }

    function handleCategoryClick(c: Category, e: MouseEvent) {
        e.preventDefault();
        store.clickCategory(c);
    }
}

export default ({ isGDPR, allowConsent }: MenuProps) =>
    useObserver(() => <>{uiState.menu ? <Menu isGDPR={isGDPR} allowConsent={allowConsent} /> : null}</>);
