import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import data from "../data";
import store, { uiState } from "../store";
import { BoothBase, RegularBooth, SpecialBooth } from "../store/BoothStore";
import "./Booth.scss";
import ExhibitorRow from "./ExhibitorRow";
import OverlayContent from "./OverlayContent";

function Booth() {
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
            return this.regular && !this.regular.onHold && (this.regular.price === "0" || !!this.regular.reserveUrl);
        },
        get showBuy() {
            return this.regular && !this.regular.onHold && this.regular.buyUrl && this.regular.price !== "0";
        },
        get title() {
            if (this.special) {
                return this.booth.title || this.booth.name;
            } else {
                return data.boothTerm + " " + this.booth.name;
            }
        },
        get reserveTitle() {
            return "Reserve";
        }
    }));

    return useObserver(() => {
        const bar = <div className="booth__bar">{s.title}</div>;
        let content: JSX.Element = null;
        if (s.regular) {
            const b = s.regular;
            const exhibitors = b.exhibitors.map(x => <ExhibitorRow key={x.id} exhibitor={x} className="list-row" />);
            if (s.regular.exhibitors.length === 0) {
                content = (
                    <>
                        <div className="booth__content -reg">
                            {b.onHold && <div>On Hold</div>}

                            <div className="booth__infos">
                                {b.type && !b.onHold && (
                                    <div className="booth__info">
                                        <i className="fas fa-cube" />
                                        <div className="booth__info-title">{data.boothTerm} Type</div>
                                        <div className="booth__info-val">{b.type}</div>
                                    </div>
                                )}
                                {b.size && !b.onHold && (
                                    <div className="booth__info">
                                        <i className="fas fa-expand-alt" />
                                        <div className="booth__info-title">Size</div>
                                        <div className="booth__info-val">{b.size}</div>
                                    </div>
                                )}
                                {b.price && !b.onHold && b.price !== "0" && (
                                    <div className="booth__info">
                                        <i className="fas fa-tag" />
                                        <div className="booth__info-title">Price</div>
                                        <div className="booth__info-val">{b.price}</div>
                                    </div>
                                )}
                            </div>
                            {data.reserveInstructions && !b.onHold && (
                                <span dangerouslySetInnerHTML={{ __html: data.reserveInstructions }} />
                            )}

                            {s.showBuy && (
                                <div className="booth__buy">
                                    <a href={b.buyUrl} rel="noopener">
                                        Buy
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
                        {exhibitors}
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

export default () =>
    useObserver(() => <>{!uiState.menu && uiState.details && uiState.details instanceof BoothBase ? <Booth /> : null}</>);
