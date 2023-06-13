import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import data from "../data";
import store, { uiState } from "../store";
import { RegularBooth, SpecialBooth } from "../store/BoothStore";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import settings from "../tools/settings";
import { remsToPixels } from "../utils";
import { t } from "../utils/i18n";
import isIframe from "../utils/is-iframe";
import { useAutorun } from "../utils/mobx";
import "./Booth.scss";
import Button from "./Button";
import ExhibitorRow from "./ExhibitorRow";
import OverlayContent from "./OverlayContent";
import Schedule from "./Schedule";
import SidebarActions from "./SidebarActions";

function Booth() {
    // return <div>adsa</div>;
    const s = useLocalStore(() => ({
        get booth() {
            return uiState.selectedBooth;
        },
        get regular() {
            return this.booth instanceof RegularBooth ? this.booth : null;
        },
        get special() {
            return this.booth instanceof SpecialBooth ? this.booth : null;
        },
        get showReserve() {
            return (
                !uiState.kiosk &&
                this.regular &&
                ((this.regular.price === "0" && !!this.regular.buyUrl) || !!this.regular.reserveUrl)
            );
        },
        get showBuy() {
            return !uiState.kiosk && this.regular && this.regular.buyUrl && this.regular.price && this.regular.price !== "0";
        },
        get title() {
            return this.booth.fullName;
        },
        get reserveTitle() {
            return data.reserveButtonTerm || t("Reserve");
        },
        get descriptionCombined() {
            return this.booth.description || data.reserveInstructions || "";
        },
    }));

    useAutorun(() => {
        if (s.booth) {
            sendEventToGa(GaEventActions.ViewBooth, s.booth.name);
        }
    });

    return useObserver(() => {
        const bar = <div className="booth__bar">{s.title}</div>;
        let content: JSX.Element = null;
        if (s.regular) {
            const b = s.regular;

            const exhibitors = b.exhibitors.map((x) => <ExhibitorRow key={x.id} exhibitor={x} className="list-row" />);

            if (b.onHold) {
                content = (
                    <div className="booth__content -reg">
                        <div>{t("On Hold")}</div>
                    </div>
                );
            } else if (b.reserved) {
                content = (
                    <div className="booth__content -reg">
                        <div>{t("Reserved")}</div>
                    </div>
                );
            } else if (b.exhibitors.length === 0) {
                const makeUrl = (href) => {
                    if (href) {
                        const url = new URL(href);

                        if (!url.searchParams.has("type") && b.type) {
                            url.searchParams.append("type", b.type);
                        }

                        if (!url.searchParams.has("price") && b.price) {
                            url.searchParams.append("price", b.price);
                        }
                        return url;
                    } else {
                        return null;
                    }
                };

                const buyUrl = makeUrl(b.buyUrl);
                const reserveUrl = makeUrl(b.reserveUrl);

                content = (
                    <>
                        <div className="booth__content -reg">
                            <div className="booth__infos">
                                {b.type && (
                                    <div className="booth__info">
                                        <i className="fas fa-cube" />
                                        <div className="booth__info-title">
                                            {t("{{boothTerm}} Type", { boothTerm: data.boothTerm })}
                                        </div>
                                        <div className="booth__info-val">{b.type}</div>
                                    </div>
                                )}
                                {b.size && (
                                    <div className="booth__info">
                                        <i className="fas fa-expand-alt" />
                                        <div className="booth__info-title">{t("Size")}</div>
                                        <div className="booth__info-val">{b.size}</div>
                                    </div>
                                )}
                                {b.price && b.price !== "0" && (
                                    <div className="booth__info">
                                        <i className="fas fa-tag" />
                                        <div className="booth__info-title">{t("Price")}</div>
                                        <div className="booth__info-val">{b.price}</div>
                                    </div>
                                )}
                            </div>
                            {s.descriptionCombined && (
                                <span
                                    dangerouslySetInnerHTML={{ __html: s.descriptionCombined }}
                                    className="booth__reserve-instructions"
                                />
                            )}

                            {s.showBuy && (
                                <div className="booth__buy">
                                    <Button link={buyUrl?.href} target={isIframe ? "_blank" : "_self"}>
                                        {t("Buy")}
                                    </Button>
                                </div>
                            )}
                            {s.showReserve && (
                                <div className="booth__buy">
                                    <Button link={reserveUrl?.href || buyUrl?.href} target={isIframe ? "_blank" : "_self"}>
                                        {s.reserveTitle}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                );
            } else {
                content = <>{exhibitors}</>;
            }
        } else {
            content = (
                <div className="booth__content -spec">
                    {!!s.special.description}
                    <div className="booth__desc" dangerouslySetInnerHTML={{ __html: s.special.description }} />
                </div>
            );
        }

        return (
            <OverlayContent bar={bar} backMode="none" onClose={() => store.selectNone()}>
                {!data.isRebooking && settings.wayfinding && (
                    <div
                        className="exhibitor__directions"
                        style={{ paddingLeft: 15, paddingRight: 15, marginTop: remsToPixels(1) }}
                    >
                        <SidebarActions
                            showBookmark={false}
                            showShare={false}
                            onClickDirections={() => {
                                store.routeStore.clickRoute(null, s.booth);
                            }}
                        />
                    </div>
                )}
                {!data.isRebooking && content}
                {!!s.booth.schedule?.length && <Schedule events={s.booth.schedule} />}
            </OverlayContent>
        );
    });
}

export default () => useObserver(() => (!uiState.menu && uiState.selectedBooth ? <Booth /> : null));
