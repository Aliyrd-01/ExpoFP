import { useObserver } from "mobx-react-lite";
import React from "react";
import store, { boothStore, exhibitorStore, uiState } from "../store";
import Route from "../store/RouteStore";
import { t } from "../utils/i18n";
import OverlayContent from "./OverlayContent";

function Wayfinding() {
    return useObserver(() => {
        const bar = <div className="bar">{t("Directions")}</div>;

        const boothsIDs = [];
        const options = (except: string) => {
            const o = [];
            exhibitorStore.exhibitors.forEach((e) => {
                boothsIDs.push(...e.booths.map((b) => b.id));
                o.push(
                    ...e.booths
                        .filter((b) => b.name != except)
                        .map((booth) => (
                            <option key={`${e.id}${booth.id}`} value={booth.name}>
                                {e.name} - {booth.name}
                            </option>
                        ))
                );
            });

            boothStore.booths
                .filter((booth) => boothsIDs.indexOf(booth.id) == -1 && booth.name !== except)
                .forEach((booth) => {
                    o.push(
                        <option key={`${booth.id}`} value={booth.name}>
                            {booth.name}
                        </option>
                    );
                });

            return o;
        };

        // const options = (except: string) => {
        //     return boothStore.booths
        //         .filter((b) => b.name !== except)
        //         .map((booth) => (
        //             <option key={`${booth.id}`} value={booth.name}>
        //                 {booth.name}
        //             </option>
        //         ));
        // };

        const onSelectionClick = (name: string, isFrom: boolean = true) => {
            const booth = boothStore.booths.filter((b) => b.name === name)[0];
            const { from, to, exceptUnaccessible } = uiState.selectedRoute;

            if (isFrom) store.selectRoute(new Route(booth || null, to, exceptUnaccessible));
            else store.selectRoute(new Route(from, booth || null, exceptUnaccessible));
        };

        const onExceptUnaccessible = (exceptUnaccessible: boolean) => {
            const { from, to } = uiState.selectedRoute;
            store.selectRoute(new Route(from, to, exceptUnaccessible));
        };

        return (
            <OverlayContent bar={bar} backMode="back" onBack={() => store.selectSearch()} onClose={() => store.selectNone()}>
                <select
                    value={uiState.selectedRoute.from?.name || ""}
                    onChange={(e) => onSelectionClick(e.target.value, true)}
                    style={{ margin: 5, width: "96%", padding: 6, border: "1px #e3e3e3 solid" }}
                >
                    <option value=""> </option>
                    {options(uiState.selectedRoute.to?.name)}
                </select>
                <select
                    value={uiState.selectedRoute.to?.name || ""}
                    onChange={(e) => onSelectionClick(e.target.value, false)}
                    style={{ margin: 5, width: "96%", padding: 6, border: "1px #e3e3e3 solid" }}
                >
                    <option value=""> </option>
                    {options(uiState.selectedRoute.from?.name)}
                </select>

                <div style={{ margin: 10 }}>
                    <input
                        id="exceptUnaccessible"
                        type="checkbox"
                        checked={uiState.selectedRoute.exceptUnaccessible}
                        onChange={(e) => onExceptUnaccessible(e.target.checked)}
                    ></input>
                    &nbsp;&nbsp;
                    <label htmlFor="exceptUnaccessible">Only accessible ways</label>
                </div>
            </OverlayContent>
        );
    });
}

export default () => useObserver(() => !uiState.menu && uiState.selectedRoute && <Wayfinding />);
