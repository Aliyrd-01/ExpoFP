import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { RegularBooth, SpecialBooth } from "../core/Booth";
// import store, { uiState } from "../store";
import { useData, useStore, useUiState } from "../tools/use";
import { useAutorun } from "../utils/mobx";
import "./Booth.scss";
import ExhibitorRow from "./ExhibitorRow";
import OverlayContent from "./OverlayContent";

function Booth() {
    // return <div>adsa</div>;
    const uiState = useUiState();
    const store = useStore();
    const data = useData();

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
            return "Reserve";
        },
        get descriptionCombined() {
            return this.booth.description || data.reserveInstructions || "";
        },

        adminContent: null
    }));

    useAutorun(async () => {
        if (uiState.showAdminUi && s.regular) {
            const BoothAdmin = await (await import(/* webpackChunkName: "admin" */ "./BoothAdmin")).default;
            s.adminContent = <BoothAdmin booth={s.booth as RegularBooth} key={s.booth.name} />;
        } else {
            s.adminContent = null;
        }
    });

    return useObserver(() => {
        const bar = <div className="booth__bar">{s.title}</div>;
        let content: JSX.Element = null;
        if (s.regular) {
            const b = s.regular;

            const exhibitors = b.exhibitors.map(x => <ExhibitorRow key={x.id} exhibitor={x} className="list-row" />);

            if (b.onHold) {
                content = (
                    <div className="booth__content -reg">
                        <div>On Hold</div>
                    </div>
                );
            } else if (b.reserved) {
                content = (
                    <div className="booth__content -reg">
                        <div>Reserved</div>
                    </div>
                );
            } else if (b.exhibitorIds.length === 0) {
                content = (
                    <>
                        <div className="booth__content -reg">
                            <div className="booth__infos">
                                {b.type && (
                                    <div className="booth__info">
                                        <i className="fas fa-cube" />
                                        <div className="booth__info-title">{data.boothTerm} Type</div>
                                        <div className="booth__info-val">{b.type}</div>
                                    </div>
                                )}
                                {b.size && (
                                    <div className="booth__info">
                                        <i className="fas fa-expand-alt" />
                                        <div className="booth__info-title">Size</div>
                                        <div className="booth__info-val">{b.size}</div>
                                    </div>
                                )}
                                {b.price && b.price !== "0" && (
                                    <div className="booth__info">
                                        <i className="fas fa-tag" />
                                        <div className="booth__info-title">Price</div>
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

        // let adminContent: JSX.Element = null;
        // if (uiState.showAdminUi && s.regular) {
        //     adminContent = <BoothAdmin booth={s.booth as RegularBooth} />;
        // }

        return (
            <OverlayContent bar={bar} backMode="none" onClose={() => store.selectNone()}>
                {s.adminContent}
                {content}
            </OverlayContent>
        );
    });
}

export default () =>
    useObserver(() => {
        const uiState = useUiState();
        return !uiState.menu && uiState.selectedBooth ? <Booth /> : null;
    });
