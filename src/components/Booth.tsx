import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import data from "../data";
import store, { uiState } from "../store";
import { RegularBooth, SpecialBooth } from "../store/BoothStore";
import { t } from "../utils/i18n";
import "./Booth.scss";
import ExhibitorRow from "./ExhibitorRow";
import OverlayContent from "./OverlayContent";

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
            return this.regular && ((this.regular.price === "0" && !!this.regular.buyUrl) || !!this.regular.reserveUrl);
        },
        get showBuy() {
            return this.regular && this.regular.buyUrl && this.regular.price !== "0";
        },
        get title() {
            if (this.special) {
                return this.booth.title || this.booth.name;
            } else {
                return data.boothTerm + " " + this.booth.name;
            }
        },
        get reserveTitle() {
            return t("Reserve");
        },
        get descriptionCombined() {
            return this.booth.description || data.reserveInstructions || "";
        },
    }));

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
                content = (
                    <>
                        <div className="booth__content -reg">
                            <div className="booth__infos">
                                {b.type && (
                                    <div className="booth__info">
                                        <i className="fas fa-cube" />
                                        <div className="booth__info-title">
                                            {t("{{boothTerm}} Type", { boothTerm: data.boothTerm })} Type
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
                                    <a href={b.buyUrl} rel="noopener">
                                        {t("Buy")}
                                    </a>
                                </div>
                            )}
                            {s.showReserve && (
                                <div className="booth__buy">
                                    <a href={b.reserveUrl || b.buyUrl} rel="noopener">
                                        {s.reserveTitle}
                                    </a>
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
                {content}
            </OverlayContent>
        );
    });
}

export default () => useObserver(() => (!uiState.menu && uiState.selectedBooth ? <Booth /> : null));
