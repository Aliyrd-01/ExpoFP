import { useObserver } from "mobx-react-lite";
import React from "react";
import data from "../data";
import { getLayerSvg } from "../data/svg";
import store, { boothStore, exhibitorStore, uiState } from "../store";
import { Route } from "../store/RouteStore";
import settings from "../tools/settings";
import { t } from "../utils/i18n";
import WayfindingTemplate from "./WayfindingTemplate";
import OverlayContent from "./OverlayContent";
import "./Wayfinding.scss";

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

        const booths = () =>
            store.routeStore.defaultFrom ? boothStore.booths.concat([store.routeStore.defaultFrom]) : boothStore.booths;

        const options = () => {
            const optionsList = [];

            exhibitorStore.exhibitors.forEach((e) => {
                boothsIDs.push(...e.booths.map((b) => b.id));
                optionsList.push(
                    ...e.booths.map((booth) => ({
                        value: booth.name,
                        label: e.name + " - " + booth.fullName,
                    }))
                );
            });

            booths()
                .filter((booth) => boothsIDs.indexOf(booth.id) === -1)
                .forEach((booth) => {
                    optionsList.push({
                        value: booth.name,
                        label: booth.fullName,
                    });
                });

            return optionsList;
        };

        const onSelectionClick = (name: string, isFrom: boolean = true) => {
            const booth = booths().filter((b) => b.name === name)[0];
            const { from, to, exceptUnaccessible } = uiState.selectedRoute;

            if (isFrom) store.routeStore.selectRoute(new Route(booth || null, to, exceptUnaccessible));
            else store.routeStore.selectRoute(new Route(from, booth || null, exceptUnaccessible));
        };

        // const onExceptUnaccessible = (exceptUnaccessible: boolean) => {
        //     const { from, to } = uiState.selectedRoute;
        //     store.routeStore.selectRoute(new Route(from, to, exceptUnaccessible));
        // };

        const getWayInformation = (distance) => {
            const info = [];
            const units = getLayerSvg().getAttribute("units");
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

        const onSwitch = () => {
            const { from, to, exceptUnaccessible } = uiState.selectedRoute;
            store.routeStore.selectRoute(new Route(to, from, exceptUnaccessible));
        };

        const routeNotFound = uiState.selectedRoute?.from && uiState.selectedRoute?.to && !store.routeStore.routeLines.length;

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
                <WayfindingTemplate
                    showForm={!mobileShowForm() ? true : false}
                    showInfo={
                        !data.hideWayInformation &&
                        settings.EXPO !== "bloomberg" &&
                        uiState.selectedRoute?.from &&
                        uiState.selectedRoute?.to
                            ? true
                            : false
                    }
                    floors={store.routeStore.layers.map((l) => l.description)}
                    currentFloor={store?.routeStore.layers.find((l) => l.visible)?.description}
                    onClickFloor={(floor) =>
                        store.layerStore.updateVisibility(store.layerStore.layers.find((l) => l.description === floor).name, true)
                    }
                    routeFound={!routeNotFound}
                    options={options()}
                    fromValue={uiState.selectedRoute?.from?.name || ""}
                    toValue={uiState.selectedRoute?.to?.name || ""}
                    onChangeFrom={(value) => onSelectionClick(value, true)}
                    onChangeTo={(value) => onSelectionClick(value, false)}
                    onSwitch={onSwitch}
                    infoItems={getWayInformation(store.routeStore.routeDistance)}
                    infoAccessible={uiState.selectedRoute.exceptUnaccessible}
                    onClickInfo={() => store.showOverlay()}
                />
            </OverlayContent>
        );
    });
}

export default () => useObserver(() => settings.wayfinding && !uiState.menu && uiState.selectedRoute && <Wayfinding />);
