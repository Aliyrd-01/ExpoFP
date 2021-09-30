import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { MouseEvent, Suspense, useRef } from "react";
import data from "../data";
import store, { uiState } from "../store";
import { Category } from "../store/CategoryStore";
import Route from "../store/RouteStore";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import logger from "../tools/logger";
import settings from "../tools/settings";
import trackEvent from "../tools/track-event";
import { t } from "../utils/i18n";
import { useAutorun, useReaction } from "../utils/mobx";
import BookmarkSvg from "./BookmarkSvg";
import "./Exhibitor.scss";
import OverlayContent from "./OverlayContent";
import { FillMode } from "./Slider/ImageSliderData";

const ImageSlider = React.lazy(() => import(/* webpackChunkName: "slider" */ "./Slider/ImageSlider"));

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

    useAutorun(() => {
        if (s.exhibitor) {
            trackEvent("exview", s.exhibitor.id);
            sendEventToGa(`FP Exhibitor`, GaEventActions.View, s.exhibitor.name);
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

    function customButtonClick() {
        sendEventToGa(`FP Exhibitor`, GaEventActions.ClickCustomButton, s.exhibitor.name);
    }

    function itemClick(action: GaEventActions) {
        sendEventToGa(`FP Exhibitor`, action, s.exhibitor.name);
    }

    return useObserver(() => {
        const exhibitor = s.exhibitor;
        // if (!exhibitor) return null;
        const bar = (
            <>
                <div className="exhibitor__bar">
                    <span onClick={() => store.toggleMapOverlay()}>
                        <span>{exhibitor.name}</span>
                        {exhibitor.featured ? <i className="fas fa-gem" /> : null}
                    </span>
                    {uiState.kiosk ? null : (
                        <a href="/" onClick={bookmark} className="exhibitor__bar-bk">
                            <BookmarkSvg />
                        </a>
                    )}
                </div>
                <div className="exhibitor__bar-booth" onClick={() => store.toggleMapOverlay()}>
                    {data.boothTerm} {exhibitor.booths.map((b) => b.name).join(", ")}
                </div>
            </>
        );

        const cls = classNames({
            exhibitor: true,
            "-exhibitor-featured": exhibitor.featured,
            bookmarked: exhibitor.bookmarked,
        });

        const expandDescription = () => {
            s.collapsed = false;
            setTimeout(s.updateOverlayContent);
        };

        function renderButton(title: string, url: string) {
            if (!title || !url) return null;
            return (
                <div className="exhibitor__custom-btn-area">
                    <a href={url} onClick={customButtonClick} target="_blank" rel="noopener noreferrer">
                        {title}
                    </a>
                </div>
            );
        }

        return (
            <OverlayContent
                className={cls}
                backMode="none"
                onClose={() => store.selectNone()}
                particles={exhibitor.featured}
                bar={bar}
                onUpdateFuncSet={(f) => (s.updateOverlayContent = f)}
            >
                {exhibitor.leadingImageUrl ? (
                    <div className="exhibitor__leading-image-container exhibitor__slider">
                        {exhibitor.leadingImageLinkUrl ? (
                            <a href={exhibitor.leadingImageLinkUrl} target="_blank" rel="noopener noreferrer">
                                <img src={exhibitor.leadingImageUrl} className="exhibitor__leading-image" alt="" />
                            </a>
                        ) : (
                            <Suspense fallback={null}>
                                <ImageSlider hideFullScreenIcon={true} images={[exhibitor.leadingImageUrl]} />
                            </Suspense>
                        )}
                    </div>
                ) : null}

                <div className="exhibitor__details">
                    <div className="exhibitor__categories">
                        {exhibitor.booths.map((booth) => (
                            <a
                                href={`?${exhibitor.slug}`}
                                key={booth.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    store.toggleMapOverlay();
                                }}
                                className="exhibitor__categories-booth"
                            >
                                {data.boothTerm} {booth.name}
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
                                className={c.sponsorship ? "exhibitor__categories-sponsorship" : "exhibitor__categories-cat"}
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
                                    dangerouslySetInnerHTML={{ __html: exhibitor.description }}
                                    onClick={expandDescription}
                                />
                            ) : null}
                        </div>
                    ) : null}
                    {exhibitor.videoUrl ? (
                        <div className="exhibitor__video">
                            <iframe
                                src={exhibitor.videoUrl}
                                frameBorder="0"
                                data-allow="encrypted-media; autoplay; fullscreen"
                                title="Exhibitor Video"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : null}
                    {exhibitor.gallery ? (
                        <div className="exhibitor__slider" onClick={() => itemClick(GaEventActions.ViewGallery)}>
                            <Suspense fallback={null}>
                                <ImageSlider fillMode={FillMode.cover} images={exhibitor.gallery} />
                            </Suspense>
                        </div>
                    ) : null}
                    {exhibitor.marketMaterials ? (
                        <div className="exhibitor__market-materials">
                            {exhibitor.marketMaterials.map((marketMaterial) => {
                                return (
                                    <div>
                                        <a
                                            href={marketMaterial.path}
                                            key={marketMaterial.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {marketMaterial.fileName}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                    {s.anyAddress ? <div className="exhibitor__sep" /> : null}
                    {s.showEdit ? (
                        <div className="exhibitor__edit">
                            <button className="far fa-pencil" title={t("Edit")} onClick={sendLoginLink} />
                        </div>
                    ) : null}
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
                                                {!!(exhibitor.state && exhibitor.zip) && <span>&nbsp;</span>} {exhibitor.zip}
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
                    {s.anySocial && <div className="exhibitor__sep" />}
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
                    <div className="exhibitor__directions">
                        <button
                            onClick={() =>
                                store.selectRoute(
                                    new Route(null, exhibitor.booths[0], uiState.selectedRoute?.exceptUnaccessible || false)
                                )
                            }
                        >
                            Directions
                        </button>
                    </div>
                    {renderButton(exhibitor.customButtonTitle, exhibitor.customButtonUrl)}
                    {renderButton(exhibitor.customButton2Title, exhibitor.customButton2Url)}
                    {renderButton(exhibitor.customButton3Title, exhibitor.customButton3Url)}
                </div>
            </OverlayContent>
        );
    });

    function handleCategoryClick(c: Category) {
        store.selectCategory(c);
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
            alert(t("Error sending login instructions."));
        }

        xhr.onload = function (e) {
            if (this.status !== 200) {
                er();
                return;
            }
            alert(t("A link to edit profile was sent to {{email}}.", { email }));
        };
        xhr.onerror = function (e) {
            logger.error("Error", e);
            er();
        };
        xhr.send(JSON.stringify({ id: s.exhibitor.id }));
    }

    function bookmark(e: MouseEvent) {
        e.preventDefault();
        s.exhibitor.bookmarked = !s.exhibitor.bookmarked;
    }
}

export default () => useObserver(() => <>{!uiState.menu && uiState.selectedExhibitor ? <ExhibitorComponent /> : null}</>);
