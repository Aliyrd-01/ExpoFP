import { useObserver } from "mobx-react-lite";
import React from "react";
import data from "../data";
import svg from "../data/svg";
import store, { boothStore, exhibitorStore, uiState } from "../store";
import { Route } from "../store/RouteStore";
import settings from "../tools/settings";
import { t } from "../utils/i18n";
import Autocomplete from "./Autocomplete";
import OverlayContent from "./OverlayContent";
import ToggleSwitch from "./ToggleSwitch";
import "./Wayfinding.scss";
import WayInformation from "./WayInformation";

function Wayfinding() {
    const routeSelected = () => {
        const { from, to } = uiState.selectedRoute;
        return from && to ? true : false;
    };

    const mobileFullOverlaySize = () => {
        return uiState.overlaySize === "full" ? true : false;
    };

    const mobileShowForm = () => {
        return routeSelected() && !mobileFullOverlaySize() ? true : false;
    };

    return useObserver(() => {
        const bar = <div className="wayfinding__bar bar">{t("Directions")}</div>;
        const boothsIDs = [];

        const options = () => {
            const optionsList = [];

            exhibitorStore.exhibitors.forEach((e) => {
                boothsIDs.push(...e.booths.map((b) => b.id));
                optionsList.push(
                    ...e.booths.map((booth) => ({
                        value: booth.name,
                        label: e.name + " - " + booth.name,
                    }))
                );
            });

            boothStore.booths
                .filter((booth) => boothsIDs.indexOf(booth.id) === -1)
                .forEach((booth) => {
                    optionsList.push({
                        value: booth.name,
                        label: booth.name,
                    });
                });

            return optionsList;
        };

        const onSelectionClick = (name: string, isFrom: boolean = true) => {
            const booth = boothStore.booths.filter((b) => b.name === name)[0];
            const { from, to, exceptUnaccessible } = uiState.selectedRoute;

            if (isFrom) store.routeStore.selectRoute(new Route(booth || null, to, exceptUnaccessible));
            else store.routeStore.selectRoute(new Route(from, booth || null, exceptUnaccessible));
        };

        const onExceptUnaccessible = (exceptUnaccessible: boolean) => {
            const { from, to } = uiState.selectedRoute;
            store.routeStore.selectRoute(new Route(from, to, exceptUnaccessible));
        };

        const getWayInformation = (distance) => {
            const info = [];
            const units = svg.getAttribute("units");
            const seconds = Math.round(distance / (units === "m" ? 1.4 : 4.2));
            let est = new Date();
            est.setMinutes(est.getMinutes() + seconds / 60);
            const estTotal = est.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            info.push(
                {
                    title: "Travel time",
                    text: seconds < 60 ? "< 1 min" : `~ ${Math.round(seconds / 60)} min`,
                },
                {
                    title: "Distance",
                    text: Math.round(distance) + ` ${units}`,
                },
                {
                    title: "Est arrival",
                    text: estTotal,
                }
            );

            return info;
        };

        const wayFindingForm = () => {
            return (
                <div className="wayFindingForm" style={{ marginBottom: 10 }}>
                    <div className="wayFindingForm__icons">
                        <div className="wayFindingForm__icons-item is-from"></div>
                        <div className="wayFindingForm__icons-item is-to"></div>
                    </div>
                    <div className="wayFindingForm__controls">
                        <div className="formGroup" style={{ marginBottom: 10 }}>
                            <Autocomplete
                                placeholder="Select from"
                                options={options()}
                                value={uiState.selectedRoute.from?.name || ""}
                                onChange={(value) => onSelectionClick(value, true)}
                            />
                        </div>
                        <div className="formGroup" style={{ marginBottom: 20 }}>
                            <Autocomplete
                                placeholder="Select to"
                                options={options()}
                                value={uiState.selectedRoute.to?.name || ""}
                                onChange={(value) => onSelectionClick(value, false)}
                            />
                        </div>
                        <div className="formGroup" style={{ marginBottom: 10 }}>
                            <ToggleSwitch
                                name="exceptUnaccessible"
                                label="Accessible"
                                value={uiState.selectedRoute.exceptUnaccessible}
                                onChange={(value) => onExceptUnaccessible(value)}
                            />
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <OverlayContent
                bar={bar}
                backMode="none"
                onBack={() => {
                    store.routeStore.selectRoute(null);
                    store.selectSearch();
                }}
                onClose={() => {
                    store.routeStore.selectRoute(null);
                    store.selectNone();
                }}
            >
                {!mobileShowForm() ? wayFindingForm() : null}
                <div className="wayInformationContainer">
                    {!data.hideWayInformation &&
                    settings.EXPO !== "bloomberg" &&
                    uiState.selectedRoute?.from &&
                    uiState.selectedRoute.from ? (
                        store.routeStore.routeLines.length ? (
                            <WayInformation items={getWayInformation(store.routeStore.routeDistance)} />
                        ) : (
                            <div style={{ textAlign: "center", fontWeight: "bold" }}>Route not found</div>
                        )
                    ) : null}
                </div>
            </OverlayContent>
        );
    });
}

export default () => useObserver(() => !uiState.menu && uiState.selectedRoute && <Wayfinding />);
