import { useObserver } from "mobx-react-lite";
import React from "react";
import store, { boothStore, exhibitorStore, uiState } from "../store";
import Route from "../store/RouteStore";
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

        const options = (except: string) => {
            const optionsList = [{ value: "", label: "" }];

            exhibitorStore.exhibitors.forEach((e) => {
                boothsIDs.push(...e.booths.map((b) => b.id));
                optionsList.push(
                    ...e.booths
                        .filter((b) => b.name !== except)
                        .map((booth) => ({
                            value: booth.name,
                            label: e.name + " - " + booth.name,
                        }))
                );
            });

            boothStore.booths
                .filter((booth) => boothsIDs.indexOf(booth.id) === -1 && booth.name !== except)
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

            console.info(booth, from, to);

            if (isFrom) store.selectRoute(new Route(booth || null, to, exceptUnaccessible));
            else store.selectRoute(new Route(from, booth || null, exceptUnaccessible));
        };

        const onExceptUnaccessible = (exceptUnaccessible: boolean) => {
            const { from, to } = uiState.selectedRoute;
            store.selectRoute(new Route(from, to, exceptUnaccessible));
        };

        const exampleDistanceData = 400;
        const getWayInformation = (distance, stepsPerMinute = 110) => {
            const data = [];
            const minutes = Math.round(distance / stepsPerMinute);
            let est = new Date();
            est.setMinutes(est.getMinutes() + minutes);
            const estTotal = est.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            data.push(
                {
                    title: "Travel time",
                    text: minutes + " min",
                },
                {
                    title: "Distance",
                    text: distance + " m",
                },
                {
                    title: "Est arrival",
                    text: estTotal,
                }
            );

            return data;
        };

        return (
            <OverlayContent bar={bar} backMode="back" onBack={() => store.selectSearch()} onClose={() => store.selectNone()}>
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
                                options={options(uiState.selectedRoute.to?.name)}
                                value={uiState.selectedRoute.from?.name || ""}
                                onChange={(value) => onSelectionClick(value, true)}
                            />
                        </div>
                        <div className="formGroup" style={{ marginBottom: 20 }}>
                            <Autocomplete
                                placeholder="Select to"
                                options={options(uiState.selectedRoute.from?.name)}
                                value={uiState.selectedRoute.to?.name || ""}
                                onChange={(value) => onSelectionClick(value, false)}
                            />
                        </div>
                        <div className="formGroup" style={{ marginBottom: 10 }}>
                            <Checkbox
                                name="exceptUnaccessible"
                                label="Only accessible ways"
                                value={uiState.selectedRoute.exceptUnaccessible}
                                onChange={(value) => onExceptUnaccessible(value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="wayInformationContainer">
                    {uiState.selectedRoute.from?.name && uiState.selectedRoute.to?.name ? (
                        <WayInformation items={getWayInformation(exampleDistanceData)} />
                    ) : null}
                </div>
            </OverlayContent>
        );
    });
}

export default () => useObserver(() => !uiState.menu && uiState.selectedRoute && <Wayfinding />);
