import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { MouseEvent, useRef } from "react";
import data from "../data";
// import store, { uiState } from "../store";
import { Category } from "../store/CategoryStore";
import logger from "../tools/logger";
import settings from "../tools/settings";
import { useStore, useUiState } from "../tools/use";
import { useReaction } from "../utils/mobx";
import BookmarkSvg from "./BookmarkSvg";
import "./Exhibitor.scss";
import OverlayContent from "./OverlayContent";

function ExhibitorComponent() {
    const store = useStore();
    const uiState = useUiState();
    const el = useRef<HTMLDivElement>();
    const s = useLocalStore(() => ({
        collapsed: true,

        get exhibitor() {
            return uiState.selectedExhibitor;
        },
        get websiteTrimmed() {
            return this.exhibitor.website ? this.exhibitor.website.replace(/^(http(s?):\/\/)([^/]+)(\/)?$/i, "$3") : "";
        },
        get anySocial() {
            return !!["facebook", "instagram", "linkedin", "twitter", "googlePlus", "xing", "youtube"].find(
                s => this.exhibitor[s]
            );
        },
        get anyAddress() {
            return !!["address", "address2", "phone1", "website", "email"].find(s => this.exhibitor[s]);
        },
        get disableCollapse() {
            return (
                (!this.anySocial && !this.anyAddress) ||
                (uiState.overlayPosition === "left" && (this.exhibitor.description || "").length < 800)
            );
        },
        get showEdit() {
            return !!(data.sendLoginLinkUrl && this.sendLinkEmail);
        },
        get sendLinkEmail() {
            return this.exhibitor.privateEmail || this.exhibitor.email;
        }
    }));

    useReaction(
        () => s.exhibitor,
        () => {
            if (el.current) el.current.parentElement.scrollTop = 0;
            s.collapsed = true;
        }
    );

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
                    <a href="/" onClick={bookmark} className="exhibitor__bar-bk">
                        <BookmarkSvg />
                    </a>
                </div>
                <div className="exhibitor__bar-booth" onClick={() => store.toggleMapOverlay()}>
                    {data.boothTerm} {exhibitor.booths.map(b => b.name).join(", ")}
                </div>
            </>
        );

        const cls = classNames({
            exhibitor: true,
            "-exhibitor-featured": exhibitor.featured,
            bookmarked: exhibitor.bookmarked
        });

        return (
            <OverlayContent
                className={cls}
                backMode="none"
                onClose={() => store.selectNone()}
                particles={exhibitor.featured}
                bar={bar}
            >
                <div className="exhibitor__details">
                    <div className="exhibitor__categories">
                        {exhibitor.booths.map(booth => (
                            <a
                                href={`?${exhibitor.slug}`}
                                key={booth.id}
                                onClick={e => {
                                    e.preventDefault();
                                    store.toggleMapOverlay();
                                }}
                                className="exhibitor__categories-booth"
                            >
                                {data.boothTerm} {booth.name}
                            </a>
                        ))}
                        {exhibitor.categories.map(c => (
                            <a
                                href={"?" + encodeURIComponent(c.slug)}
                                key={c.id}
                                onClick={e => {
                                    e.preventDefault();
                                    handleCategoryClick(c);
                                }}
                                className="exhibitor__categories-cat"
                            >
                                {c.name}
                            </a>
                        ))}
                    </div>
                    {exhibitor.description || exhibitor.logo ? (
                        <div
                            className={classNames({ exhibitor__description: true, collapsed: s.collapsed && !s.disableCollapse })}
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
                                    onClick={() => (s.collapsed = false)}
                                />
                            ) : null}
                        </div>
                    ) : null}
                    {s.anyAddress ? <div className="exhibitor__sep" /> : null}
                    {s.showEdit ? (
                        <div className="exhibitor__edit">
                            <button className="far fa-pencil" title="Edit" onClick={sendLoginLink} />
                        </div>
                    ) : null}
                    {s.anyAddress && (
                        <div className="exhibitor__meta">
                            {!!(exhibitor.address || exhibitor.address2) && (
                                <div>
                                    <i className="fas fa-map-marker" />
                                    <div>
                                        {exhibitor.address}
                                        {!!exhibitor.address2 && <div>{exhibitor.address2}</div>}
                                        {!!(exhibitor.city || exhibitor.state || exhibitor.zip) && (
                                            <div>
                                                {exhibitor.city}
                                                {!!(exhibitor.city && exhibitor.state) && <span>,</span>}
                                                {exhibitor.state} {exhibitor.zip}
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
                                        <a href={"tel:" + exhibitor.phone1}>{exhibitor.phone1}</a>
                                    </div>
                                </div>
                            )}
                            {!!exhibitor.website && (
                                <div>
                                    <i className="fas fa-globe" />
                                    <div>
                                        <a href={exhibitor.website} target="_blank" rel="noopener noreferrer">
                                            {s.websiteTrimmed}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {!!exhibitor.email && (
                                <div v-if="exhibitor.email">
                                    <i className="fas fa-at" />
                                    <div>
                                        <a href={"mailto:" + exhibitor.email} target="_blank" rel="noopener noreferrer">
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
                            <a href={exhibitor.facebook} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-facebook" />
                            </a>
                            <a href={exhibitor.instagram} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-instagram" />
                            </a>
                            <a href={exhibitor.linkedin} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-linkedin" />
                            </a>
                            <a href={exhibitor.twitter} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-twitter" />
                            </a>
                            <a href={exhibitor.googlePlus} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-google-plus" />
                            </a>
                            <a href={exhibitor.xing} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-xing" />
                            </a>
                            <a href={exhibitor.youtube} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-youtube" />
                            </a>
                        </div>
                    )}
                </div>
            </OverlayContent>
        );
    });

    function handleCategoryClick(c: Category) {
        store.selectCategory(c);
    }

    function sendLoginLink(e: MouseEvent<HTMLButtonElement>) {
        (e.target as HTMLDivElement).blur();
        const email = s.sendLinkEmail;
        if (!window.confirm(`Send login instructions to ${email} to edit profile?`)) return;
        if (settings.EXPO === "expo") return;
        const xhr = new XMLHttpRequest();
        xhr.open("POST", data.sendLoginLinkUrl);
        xhr.setRequestHeader("Content-Type", "application/json");
        function er() {
            alert("Error sending login instructions.");
        }
        xhr.onload = function(e) {
            if (this.status !== 200) {
                er();
                return;
            }
            alert(`A link to edit profile was sent to ${email}.`);
        };
        xhr.onerror = function(e) {
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

export default () =>
    useObserver(() => {
        const uiState = useUiState();
        return <>{!uiState.menu && uiState.selectedExhibitor ? <ExhibitorComponent /> : null}</>;
    });
