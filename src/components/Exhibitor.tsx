import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { MouseEvent, Suspense, useRef, useState, useEffect } from "react";
import data from "../data";
import store, { uiState } from "../store";
import { SpecialBooth } from "../store/BoothStore";
import { Category } from "../store/CategoryStore";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import logger from "../tools/logger";
import settings from "../tools/settings";
import { t, getLocale } from "../utils/i18n";
import isMobile from "../utils/is-mobile";
import { useReaction } from "../utils/mobx";
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
import Alert from "./Alert";
import { Transition } from "react-transition-group";

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
    const [isContentOverflowing, setIsContentOverflowing] = useState(false);
    const [showKioskDetails, setShowKioskDetails] = useState<boolean>(false);
    const detailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkHeight = () => {
            if (detailsRef.current) {
                const height = detailsRef.current.offsetHeight;
                setIsContentOverflowing(height > 300);
            }
        };

        checkHeight();

        return () => {
            store.exhibitorStore.rebookingStateChangeRequested = false;
        };
    }, []);

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

    const transitionRef = useRef<HTMLDivElement>();
    const transitionStyles: Record<string, React.CSSProperties> = {
        entering: { opacity: 1 },
        entered: { opacity: 1 },
        exiting: { opacity: 0 },
        exited: { opacity: 0 },
    };
    const transitionDelay = 150;

    return useObserver(() => {
        const exhibitor = s.exhibitor;
        // if (!exhibitor) return null;
        const bar = (
            <>
                <div className="exhibitor__bar">
                    <span onClick={() => store.toggleMapOverlay()}>
                        <span dir="auto">{exhibitor.name}</span>
                        {exhibitor.featured ? <i className="icon-diamond" /> : null}
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
                    onChange={(e) =>
                        store.exhibitorStore.setRebookingState(exhibitor, parseInt(e.target.value), exhibitor.rebookingNote)
                    }
                />
                <RebookingNotes
                    state={"default"}
                    value={exhibitor.rebookingNote || ""}
                    onClickSave={(val: string) =>
                        store.exhibitorStore.setRebookingState(exhibitor, exhibitor.rebookingState, val)
                    }
                />

                <Transition
                    in={store.exhibitorStore.rebookingStateChangeRequested}
                    nodeRef={transitionRef}
                    timeout={transitionDelay}
                    appear
                    enter
                    exit
                    mountOnEnter
                    unmountOnExit
                >
                    {state => (
                        <div ref={transitionRef} style={
                            {
                                position: "fixed",
                                bottom: "1rem",
                                left: "1rem",
                                zIndex: 9999,
                                transition: `opacity ${transitionDelay}ms ease-in-out`,
                                opacity: 0,
                                ...transitionStyles[state],
                            }
                        }>
                            <Alert
                                title={(
                                    store.exhibitorStore.rebookingStateSaved
                                        ? "Changes saved."
                                        : "Oops! Something went wrong."
                                )}
                                variant={
                                    store.exhibitorStore.rebookingStateSaved
                                        ? "success"
                                        : "error"
                                }
                                inline
                                closable
                                onClose={() => {
                                    store.exhibitorStore.rebookingStateChangeRequested = false;
                                }}
                            />
                        </div>
                    )}
                </Transition>
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
                <div key={buttonNumber} className="exhibitor-custom-button">
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

        const ExhibitorCustomButtons = ({ exhibitor }: { exhibitor: any }) => {
            const buttons = [
                renderButton(exhibitor.customButtonTitle, exhibitor.customButtonUrl, 1),
                renderButton(exhibitor.customButton2Title, exhibitor.customButton2Url, 2),
                renderButton(exhibitor.customButton3Title, exhibitor.customButton3Url, 3),
            ];
            const validButtons = buttons.filter(Boolean);
            if (validButtons.length === 0) return null;
            return <div className="exhibitor-custom-buttons">{validButtons}</div>;
        };

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
                aria-label={t("Details")}
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
                            <div className="exhibitor__leading-image-container exhibitor-slider">
                                {exhibitor.leadingImageLinkUrl ? (
                                    <a href={exhibitor.leadingImageLinkUrl} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={exhibitor.leadingImageUrl}
                                            className="exhibitor__leading-image"
                                            alt=""
                                            crossOrigin="anonymous"
                                        />
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

                        <div
                            className={classNames("exhibitor__details", {
                                "details-hidden": uiState.kiosk && isContentOverflowing && !showKioskDetails,
                            })}
                            ref={detailsRef}
                        >
                            <div className="exhibitor-categories">
                                {exhibitor.booths.map((booth) => (
                                    <a
                                        href={`?${booth.slug}`}
                                        key={booth.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            store.toggleMapOverlay();
                                            store.selectBooth(booth);
                                        }}
                                        className="exhibitor-categories__booth"
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
                                            c.sponsorship ? "exhibitor-categories__sponsorship" : "exhibitor-categories__cat"
                                        }
                                    >
                                        {c.name}
                                    </a>
                                ))}
                            </div>
                            {exhibitor.description || exhibitor.logo ? (
                                <div
                                    className={classNames("exhibitor-description", {
                                        collapsed: s.collapsed && !s.disableCollapse,
                                    })}
                                >
                                    {exhibitor.logo ? (
                                        <div className="exhibitor-description__logo" v-if="exhibitor.logo">
                                            <img src={exhibitor.logo} alt={exhibitor.name} crossOrigin="anonymous" />
                                        </div>
                                    ) : null}
                                    {exhibitor.description ? (
                                        <span
                                            className="exhibitor-description__content"
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
                                <div className="exhibitor-video">
                                    <iframe
                                        src={exhibitor.videoUrl}
                                        data-allow="encrypted-media; autoplay; fullscreen"
                                        title="Exhibitor Video"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                            {exhibitor.gallery && (
                                <div className="exhibitor-slider" onClick={() => itemClick(GaEventActions.ViewGallery)}>
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
                                    <div className="exhibitor-sep" />
                                    <MarketMaterialList list={exhibitor.marketMaterials} />
                                </>
                            )}
                            {s.showEdit && <div className="exhibitor-sep" />}
                            {!uiState.kiosk && s.showEdit && (
                                <div className="exhibitor-edit">
                                    <Button size="sm" variant="secondary" onClick={sendLoginLink}>
                                        {t("Edit")}
                                    </Button>
                                </div>
                            )}
                            {s.anyAddress && (
                                <div className="exhibitor-meta">
                                    {!!(exhibitor.address || exhibitor.address2) && (
                                        <div className="exhibitor-meta__item">
                                            <div className="exhibitor-meta__icon">
                                                <i className="icon-marker-pin-solid"></i>
                                            </div>
                                            <div className="exhibitor-meta__content">
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
                                        <div className="exhibitor-meta__item">
                                            <div className="exhibitor-meta__icon">
                                                <i className="icon-phone-solid"></i>
                                            </div>
                                            <div className="exhibitor-meta__content">
                                                <a
                                                    dir="ltr"
                                                    href={"tel:" + exhibitor.phone1}
                                                    className="exhibitor-meta__link"
                                                    onClick={(e) => handleClick(e, GaEventActions.ClickPhone)}
                                                >
                                                    {exhibitor.phone1}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {!!exhibitor.website && (
                                        <div className="exhibitor-meta__item">
                                            <div className="exhibitor-meta__icon">
                                                <i className="icon-globe-solid"></i>
                                            </div>
                                            <div className="exhibitor-meta__content">
                                                <a
                                                    href={exhibitor.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="exhibitor-meta__link"
                                                    onClick={(e) => handleClick(e, GaEventActions.ClickWebsite)}
                                                >
                                                    {s.websiteTrimmed}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {!!exhibitor.email && (
                                        <div className="exhibitor-meta__item">
                                            <div className="exhibitor-meta__icon">
                                                <i className="icon-mail-at-solid"></i>
                                            </div>
                                            <div className="exhibitor-meta__content">
                                                <a
                                                    href={"mailto:" + exhibitor.email}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="exhibitor-meta__link"
                                                    onClick={(e) => handleClick(e, GaEventActions.ClickEmail)}
                                                >
                                                    {exhibitor.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {s.anySocial && (
                                        <div className="exhibitor-meta__socials">
                                            <a
                                                href={exhibitor.facebook}
                                                className="exhibitor-meta__social"
                                                onClick={() => itemClick(GaEventActions.ClickFacebook)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="icon-facebook" />
                                            </a>
                                            <a
                                                href={exhibitor.instagram}
                                                className="exhibitor-meta__social"
                                                onClick={() => itemClick(GaEventActions.ClickInstagaram)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="icon-instagram" />
                                            </a>
                                            <a
                                                href={exhibitor.linkedin}
                                                className="exhibitor-meta__social"
                                                onClick={() => itemClick(GaEventActions.ClickLinkedin)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="icon-linkedin" />
                                            </a>
                                            <a
                                                href={exhibitor.twitter}
                                                className="exhibitor-meta__social"
                                                onClick={() => itemClick(GaEventActions.ClickTwitter)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="icon-twitter-x" />
                                            </a>
                                            <a
                                                href={exhibitor.xing}
                                                className="exhibitor-meta__social"
                                                onClick={() => itemClick(GaEventActions.ClickXing)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="icon-xing" />
                                            </a>
                                            <a
                                                href={exhibitor.youtube}
                                                className="exhibitor-meta__social"
                                                onClick={() => itemClick(GaEventActions.ClickYoutube)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="icon-youtube" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                            <ExhibitorCustomButtons exhibitor={exhibitor} />
                        </div>
                        {uiState.kiosk && isContentOverflowing && !showKioskDetails ? (
                            <div className="show-details-button">
                                <button type="button" onClick={() => setShowKioskDetails(true)}>
                                    {t("Show More")}
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : (
                    rebooking
                )}
                {uiState.kiosk && isContentOverflowing && showKioskDetails ? (
                    <button type="button" className="hide-details-button" onClick={() => setShowKioskDetails(false)}>
                        <i className="icon-chevron-up-narrow"></i>
                    </button>
                ) : null}
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
        if (uiState.onBookmarkClick)
            uiState.onBookmarkClick({
                name: s.exhibitor.name,
                bookmarked: s.exhibitor.bookmarked,
                externalId: s.exhibitor.externalId,
            });
    }
}

export default () => useObserver(() => <>{!uiState.menu && uiState.selectedExhibitor ? <ExhibitorComponent /> : null}</>);
