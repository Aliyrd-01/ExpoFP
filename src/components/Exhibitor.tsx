import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { MouseEvent, Suspense, useRef } from "react";
import data from "../data";
import store, { uiState } from "../store";
import { SpecialBooth } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import logger from "../tools/logger";
import settings from "../tools/settings";
import trackEvent from "../tools/track-event";
import { t, getLocale } from "../utils/i18n";
import isMobile from "../utils/is-mobile";
import { useAutorun, useReaction } from "../utils/mobx";
import Button from "./Button";
import ErrorBoundary from "./ErrorBoundary";
import "./Exhibitor.scss";
import MarketMaterialList from "./MarketMaterialList";
import OverlayContent from "./OverlayContent";
import RebookingNotes from "./RebookingNotes";
import RebookingRadioGroup, { defaultRebookingOptions } from "./RebookingRadioGroup";
import Schedule from "./Schedule";
import SibebarActions from "./SidebarActions";
import useHeatmapOverlay from "../utils/useHeatmapOverlay";

const Gallery = React.lazy(() => import(/* webpackChunkName: "gallery" */ "./Gallery/Gallery"));

function ExhibitorComponent() {
    const el = useRef<HTMLDivElement>();
    const s = useLocalStore(() => ({
        collapsed: true,
        updateOverlayContent: null as () => void,

        get exhibitor() {
            return uiState.selectedExhibitor;
        },
        get websiteTrimmed() {
            return this.exhibitor.website ? this.exhibitor.website.replace(/^(http(s?):\/\/)([^/]+)(\/)?$/i, "$3") : "";
        },
        get anySocial() {
            if (uiState.kiosk) return false;
            return !!["facebook", "instagram", "linkedin", "twitter", "googlePlus", "xing", "youtube"].find(
                (s) => this.exhibitor[s]
            );
        },
        get anyAddress() {
            return !!["address", "address2", "phone1", "website", "email"].find((s) => this.exhibitor[s]);
        },
        get anyMedia() {
            return !!this.exhibitor.videoUrl || !!(this.exhibitor.gallery && this.exhibitor.gallery.length);
        },
        get anyButtons() {
            return !!(this.exhibitor.customButtonTitle || this.exhibitor.customButton2Title || this.exhibitor.customButton3Title);
        },
        get disableCollapse() {
            return (
                (!this.anySocial && !this.anyAddress && !this.anyMedia && !this.anyButtons) ||
                (uiState.overlayPosition === "left" && (this.exhibitor.description || "").length < 800)
            );
        },
        get showEdit() {
            return !!(data.sendLoginLinkUrl && this.sendLinkEmail);
        },
        get sendLinkEmail() {
            return this.exhibitor.privateEmail || this.exhibitor.email;
        },
    }));
    const { heatmapBar, overlayBarStyle } = useHeatmapOverlay(s.exhibitor, s.exhibitor.featured ? "#999" : "#555");

    useAutorun(() => {
        if (store.heatmapStore.forceTrack) {
            sendEventToGa(store.heatmapStore.forceTrack.action, store.heatmapStore.forceTrack.label);
            store.heatmapStore.forceTrack = null;
        } else if (s.exhibitor) {
            trackEvent("exview", s.exhibitor.id);
            sendEventToGa(GaEventActions.ViewExhibitor, s.exhibitor.name);
        }
    });

    useReaction(
        () => s.exhibitor,
        () => {
            if (el.current) el.current.parentElement.scrollTop = 0;
            s.collapsed = true;
        }
    );

    function handleClick(e: any, action: GaEventActions) {
        itemClick(action);
        if (uiState.kiosk) return e.preventDefault();
    }

    function customButtonClick(buttonNumber: number, buttonUrl: string, e: MouseEvent) {
        sendEventToGa(GaEventActions.ClickCustomButton, s.exhibitor.name);

        const data = {
            externalId: s.exhibitor.externalId,
            buttonNumber,
            buttonUrl,
            preventDefault: e.preventDefault.bind(e),
        };
        if (uiState.onExhibitorCustomButtonClick) {
            uiState.onExhibitorCustomButtonClick(data);
        }
    }

    function itemClick(action: GaEventActions) {
        sendEventToGa(action, s.exhibitor.name);
    }

    return useObserver(() => {
        const exhibitor = s.exhibitor;
        // if (!exhibitor) return null;
        const bar = (
            <>
                <div className="exhibitor__bar">
                    <span onClick={() => store.toggleMapOverlay()}>
                        <span dir="auto">{exhibitor.name}</span>
                        {exhibitor.featured ? <i className="fas fa-gem" /> : null}
                    </span>
                </div>
                <div className="exhibitor__bar-booth" onClick={() => store.toggleMapOverlay()}>
                    {data.boothTerm} {exhibitor.booths.map((b) => b.fullName).join(", ")}
                </div>
            </>
        );

        const rebooking = data.isRebooking ? (
            <div>
                <RebookingRadioGroup
                    showTitle={false}
                    options={defaultRebookingOptions}
                    checked={exhibitor.rebookingState.toString()}
                    onChange={(e) => store.exhibitorStore.setRebookingState(exhibitor, parseInt(e.target.value), exhibitor.rebookingNote)}
                />
                <RebookingNotes
                    state={"default"}
                    value={exhibitor.rebookingNote || ""}
                    onClickSave={(val: string) =>
                        store.exhibitorStore.setRebookingState(exhibitor, exhibitor.rebookingState, val)
                    }
                />
            </div>
        ) : null;
        const cls = classNames({
            exhibitor: true,
            "-exhibitor-featured": exhibitor.featured,
            bookmarked: exhibitor.bookmarked,
            [uiState.responsiveClass]: true,
        });

        const expandDescription = () => {
            s.collapsed = false;
            setTimeout(s.updateOverlayContent);
        };

        function renderButton(title: string, url: string, buttonNumber: number) {
            if (!title || !url || uiState.kiosk || uiState.previewMode) return null;
            return (
                <div className="exhibitor__custom-btn-area">
                    <Button
                        link={url}
                        inline={true}
                        onClick={(e) => {
                            customButtonClick(buttonNumber, url, e);
                        }}
                        target="_blank"
                    >
                        {title}
                    </Button>
                </div>
            );
        }

        function getDescription(description: String) {
            if (description === null) return "";

            const descriptions = description.split(RegExp("(?=!\\*\\/\\/\\|\\|\\^\\^[a-z]{2}\\^\\^\\/\\/\\|\\|\\*!)"));
            const lang = `!*//||^^${getLocale()}^^//||*!`;

            const result = descriptions.find((p) => p.startsWith(lang));
            if (result != null) {
                return result.substring(18);
            } else if (descriptions[0].startsWith(`!*//||^^`) && descriptions[0].length > 18) {
                return descriptions[0].substring(18);
            }

            return descriptions[0];
        }

        function shareButtonVisible() {
            return (
                !data.hideShareButton &&
                !uiState.kiosk &&
                window.location.host.endsWith(".expofp.com") &&
                settings.EXPO !== "globalaltsmiami2024"
            );
        }

        function onUpdateGallery() {
            s.updateOverlayContent();
        }

        return (
            <OverlayContent
                className={cls}
                backMode="none"
                overlayBarEndContent={heatmapBar}
                overlayBarStyle={overlayBarStyle}
                onClose={() => store.selectNone()}
                particles={exhibitor.featured}
                bar={bar}
                onUpdateFuncSet={(f) => (s.updateOverlayContent = f)}
            >
                {!rebooking ? (
                    <>
                        <div className="exhibitor__buttons">
                            <SibebarActions
                                showBookmark={!uiState.disableBookmarked && !data.hideBookmarks && !uiState.kiosk}
                                showDirections={exhibitor.booths.length > 0 && settings.wayfinding}
                                inBookmark={s.exhibitor.bookmarked}
                                showShare={shareButtonVisible()}
                                onClickBookmark={bookmark}
                                onClickShare={handleShare}
                                onClickDirections={() => {
                                    store.routeStore.clickRoute(null, store.routeStore.tempToBooth || exhibitor.booths[0]);
                                }}
                            />
                        </div>

                        {exhibitor.leadingImageUrl ? (
                            <div className="exhibitor__leading-image-container exhibitor__slider">
                                {exhibitor.leadingImageLinkUrl ? (
                                    <a href={exhibitor.leadingImageLinkUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={exhibitor.leadingImageUrl} className="exhibitor__leading-image" alt="" />
                                    </a>
                                ) : (
                                    <ErrorBoundary>
                                        <Suspense fallback={null}>
                                            <Gallery
                                                className={uiState.responsiveClass}
                                                onOpenGallery={() => store.openGallery()}
                                                onCloseGallery={() => store.closeGallery()}
                                                onImageLoadHeightUpdate={onUpdateGallery}
                                                leading={true}
                                                images={[exhibitor.leadingImageUrl]}
                                            />
                                        </Suspense>
                                    </ErrorBoundary>
                                )}
                            </div>
                        ) : null}

                        <div className="exhibitor__details">
                            <div className="exhibitor__categories">
                                {exhibitor.booths.map((booth) => (
                                    <a
                                        href={`?${booth.slug}`}
                                        key={booth.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            store.toggleMapOverlay();
                                            if (uiState.overlayPosition !== "bottom") store.selectBooth(booth);
                                        }}
                                        className="exhibitor__categories-booth"
                                    >
                                        {booth instanceof SpecialBooth ? "" : data.boothTerm} {booth.fullName}
                                    </a>
                                ))}
                                {exhibitor.categories.map((c) => (
                                    <a
                                        href={"?" + encodeURIComponent(c.slug)}
                                        key={c.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleCategoryClick(c);
                                        }}
                                        className={
                                            c.sponsorship ? "exhibitor__categories-sponsorship" : "exhibitor__categories-cat"
                                        }
                                    >
                                        {c.name}
                                    </a>
                                ))}
                            </div>
                            {exhibitor.description || exhibitor.logo ? (
                                <div
                                    className={classNames({
                                        exhibitor__description: true,
                                        collapsed: s.collapsed && !s.disableCollapse,
                                    })}
                                >
                                    {exhibitor.logo ? (
                                        <div className="exhibitor__logo-container" v-if="exhibitor.logo">
                                            <img src={exhibitor.logo} className="exhibitor__logo" alt={exhibitor.name} />
                                        </div>
                                    ) : null}
                                    {exhibitor.description ? (
                                        <span
                                            className="exhibitor__description-html"
                                            dir="auto"
                                            dangerouslySetInnerHTML={{ __html: getDescription(exhibitor.description) }}
                                            onClick={expandDescription}
                                        />
                                    ) : null}
                                </div>
                            ) : null}
                            {(!!exhibitor.schedule?.length || !!exhibitor.booths[0]?.schedule.length) && (
                                <Schedule events={exhibitor.schedule || exhibitor.booths[0]?.schedule} />
                            )}
                            {!uiState.kiosk && exhibitor.videoUrl && (
                                <div className="exhibitor__video">
                                    <iframe
                                        src={exhibitor.videoUrl}
                                        frameBorder="0"
                                        data-allow="encrypted-media; autoplay; fullscreen"
                                        title="Exhibitor Video"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                            {exhibitor.gallery && (
                                <div className="exhibitor__slider" onClick={() => itemClick(GaEventActions.ViewGallery)}>
                                    <ErrorBoundary>
                                        <Suspense fallback={null}>
                                            <Gallery
                                                className={uiState.responsiveClass}
                                                onOpenGallery={() => store.openGallery()}
                                                onCloseGallery={() => store.closeGallery()}
                                                onImageLoadHeightUpdate={onUpdateGallery}
                                                images={exhibitor.gallery}
                                            />
                                        </Suspense>
                                    </ErrorBoundary>
                                </div>
                            )}
                            {!uiState.kiosk && exhibitor.marketMaterials && (
                                <>
                                    <div className="exhibitor__sep" />
                                    <MarketMaterialList list={exhibitor.marketMaterials} />
                                </>
                            )}
                            {(s.showEdit || s.anyAddress || s.anySocial) && <div className="exhibitor__sep" />}
                            {!uiState.kiosk && s.showEdit && (
                                <div className="exhibitor__edit">
                                    <button className="far fa-pencil" title={t("Edit")} onClick={sendLoginLink} />
                                </div>
                            )}
                            {s.anyAddress && (
                                <div className="exhibitor__meta">
                                    {!!(exhibitor.address || exhibitor.address2) && (
                                        <div>
                                            <i className="fas fa-map-marker" />
                                            <div className="exhibitor__address">
                                                {exhibitor.address}
                                                {!!exhibitor.address2 && <div>{exhibitor.address2}</div>}
                                                {!!(exhibitor.city || exhibitor.state || exhibitor.zip) && (
                                                    <div>
                                                        {exhibitor.city}
                                                        {!!(exhibitor.city && exhibitor.state) && <span> </span>}
                                                        {exhibitor.state}
                                                        {!!(exhibitor.state && exhibitor.zip) && <span>&nbsp;</span>}{" "}
                                                        {exhibitor.zip}
                                                    </div>
                                                )}
                                                {!!exhibitor.country && <div>{exhibitor.country}</div>}
                                            </div>
                                        </div>
                                    )}
                                    {!!exhibitor.phone1 && (
                                        <div>
                                            <i className="fas fa-phone" />
                                            <div>
                                                <a
                                                    dir="ltr"
                                                    href={"tel:" + exhibitor.phone1}
                                                    onClick={(e) => handleClick(e, GaEventActions.ClickPhone)}
                                                >
                                                    {exhibitor.phone1}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {!!exhibitor.website && (
                                        <div>
                                            <i className="fas fa-globe" />
                                            <div>
                                                <a
                                                    href={exhibitor.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => handleClick(e, GaEventActions.ClickWebsite)}
                                                >
                                                    {s.websiteTrimmed}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {!!exhibitor.email && (
                                        <div v-if="exhibitor.email">
                                            <i className="fas fa-at" />
                                            <div>
                                                <a
                                                    href={"mailto:" + exhibitor.email}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => handleClick(e, GaEventActions.ClickEmail)}
                                                >
                                                    {exhibitor.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {s.anySocial && (
                                <div className="exhibitor__social">
                                    <a
                                        href={exhibitor.facebook}
                                        onClick={() => itemClick(GaEventActions.ClickFacebook)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-facebook" />
                                    </a>
                                    <a
                                        href={exhibitor.instagram}
                                        onClick={() => itemClick(GaEventActions.ClickInstagaram)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-instagram" />
                                    </a>
                                    <a
                                        href={exhibitor.linkedin}
                                        onClick={() => itemClick(GaEventActions.ClickLinkedin)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-linkedin" />
                                    </a>
                                    <a
                                        href={exhibitor.twitter}
                                        onClick={() => itemClick(GaEventActions.ClickTwitter)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-twitter" />
                                    </a>
                                    <a
                                        href={exhibitor.googlePlus}
                                        onClick={() => itemClick(GaEventActions.ClickGooglePlus)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-google-plus" />
                                    </a>
                                    <a
                                        href={exhibitor.xing}
                                        onClick={() => itemClick(GaEventActions.ClickXing)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-xing" />
                                    </a>
                                    <a
                                        href={exhibitor.youtube}
                                        onClick={() => itemClick(GaEventActions.ClickYoutube)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="fab fa-youtube" />
                                    </a>
                                </div>
                            )}
                            {renderButton(exhibitor.customButtonTitle, exhibitor.customButtonUrl, 1)}
                            {renderButton(exhibitor.customButton2Title, exhibitor.customButton2Url, 2)}
                            {renderButton(exhibitor.customButton3Title, exhibitor.customButton3Url, 3)}
                        </div>
                    </>
                ) : (
                    rebooking
                )}
            </OverlayContent>
        );
    });

    function handleShare() {
        const navigator: any = window.navigator;
        const data = {
            title: uiState.selectedExhibitor.name,
            url: window.location.href,
        };

        if (isMobile && navigator?.canShare && navigator.canShare(data)) {
            navigator.share(data);
        } else {
            store.toggleModal("share");
        }
    }

    function handleCategoryClick(c: Category) {
        store.clickCategory(c);
    }

    function sendLoginLink(e: MouseEvent<HTMLButtonElement>) {
        if (uiState.kiosk) return e.preventDefault();

        (e.target as HTMLDivElement).blur();
        const email = s.sendLinkEmail;
        if (!window.confirm(t("Send login instructions to {{email}} to edit profile?", { email }))) return;
        if (settings.EXPO === "expo") return;
        const xhr = new XMLHttpRequest();
        xhr.open("POST", data.sendLoginLinkUrl);
        xhr.setRequestHeader("Content-Type", "application/json");

        function er() {
            alert(t("Error sending login instructions"));
        }

        xhr.onload = function (e) {
            if (this.status !== 200) {
                er();
                return;
            }
            alert(t("A link to edit profile was sent to {{email}}", { email }));
        };
        xhr.onerror = function (e) {
            logger.error("Error", e);
            er();
        };
        xhr.send(JSON.stringify({ id: s.exhibitor.id }));
    }

    function bookmark() {
        s.exhibitor.bookmarked = !s.exhibitor.bookmarked;
        if (uiState.onBookmarkClick) uiState.onBookmarkClick({ name: s.exhibitor.name, bookmarked: s.exhibitor.bookmarked });
    }
}

export default () => useObserver(() => <>{!uiState.menu && uiState.selectedExhibitor ? <ExhibitorComponent /> : null}</>);
