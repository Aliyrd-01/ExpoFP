import { useObserver } from "mobx-react-lite";
import React from "react";
import svg from "../data/svg";
import store, { boothStore, exhibitorStore, uiState } from "../store";
import { Route } from "../store/RouteStore";
import settings from "../tools/settings";
import { t } from "../utils/i18n";
import Autocomplete from "./Autocomplete";
import Checkbox from "./Checkbox";
import OverlayContent from "./OverlayContent";
import "./Wayfinding.scss";
import WayInformation from "./WayInformation";

function Wayfinding() {
    return useObserver(() => {
        const bar = <div className="bar">{t("Directions")}</div>;
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
            const data = [];
            const units = svg.getAttribute("units");
            const seconds = Math.round(distance / (units === "m" ? 1.4 : 4.2));
            let est = new Date();
            est.setMinutes(est.getMinutes() + seconds / 60);
            const estTotal = est.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            data.push(
                {
                    title: "Travel time",
                    text: `~ ${Math.round(seconds / 60)} min`,
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

            return data;
        };

        return (
            <OverlayContent
                bar={bar}
                backMode="back"
                onBack={() => {
                    store.routeStore.selectRoute(null);
                    store.selectSearch();
                }}
                onClose={() => {
                    store.routeStore.selectRoute(null);
                    store.selectNone();
                }}
            >
                <div className="wayFindingForm">
                    <div className="wayFindingForm__icons">
                        <div className="wayFindingForm__icons-item">
                            <img src="./icons/from.svg" alt="From" />
                        </div>
                        <div className="wayFindingForm__icons-item">
                            <img src="./icons/to.svg" alt="To" />
                        </div>
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
                            <Checkbox
                                name="exceptUnaccessible"
                                label="Accessible"
                                value={uiState.selectedRoute.exceptUnaccessible}
                                onChange={(value) => onExceptUnaccessible(value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="wayInformationContainer">
                    {settings.EXPO !== "bloomberg" && store.routeStore.routeDistance ? (
                        <WayInformation items={getWayInformation(store.routeStore.routeDistance)} />
                    ) : null}
                </div>
            </OverlayContent>
        );
    });
}

export default () => useObserver(() => !uiState.menu && uiState.selectedRoute && <Wayfinding />);
