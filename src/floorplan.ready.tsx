import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import FloorPlanLoader from "./floorplan.loader";
// import initStore from "./store/init";
import "./services/routing";
import store from "./store";
import { CurrentPosition, Route } from "./store/RouteStore";
import { GaEventActions, sendEventToGa } from "./tools/gtag";
import trackEvent from "./tools/track-event";
import { convertGpsToLocal, convertLocalToGps, GpsConfig } from "./utils/gps";
import data from "./data/index";
import logger from "./tools/logger";

trackEvent("load");
sendEventToGa(`FP`, GaEventActions.Load, ``);

// initStore(store);

// export default function renderFloorPlan(el: Element) {
//     ReactDOM.render(<Layout />, el);
// }

// const FpContext = React.createContext<FloorPlanReady>(null);

export default class FloorPlanReady extends FloorPlanLoader {
    // constructor(options: FloorPlanOptions) {
    //     super(options);
    // }
    protected init(): void {
        store.fp = this;
        ReactDOM.render(
            // <FpContext.Provider value={this}>
            <Layout />,
            // </FpContext.Provider>,
            this.renderTarget
        );

        data.trackGPS = true;
        if (data.trackGPS && window["__fpGeo"]?.properties?.config) {
            this.trackGps();
        }

        this.resolveReady();
    }

    private trackGps() {
        let watcher = navigator.geolocation.watchPosition(
            (pos) => {
                try {
                    const localPoint = convertGpsToLocal(
                        pos.coords.latitude,
                        pos.coords.longitude,
                        window["__fpGeo"].properties.config as GpsConfig
                    );

                    const currentPosition = new CurrentPosition(
                        localPoint.x,
                        localPoint.y,
                        null,
                        0,
                        pos.coords.latitude,
                        pos.coords.longitude
                    );
                    store.routeStore.selectCurrentPosition(currentPosition, false);
                } catch (e) {
                    logger.error(e);
                }
            },
            (err) => {
                if (watcher) {
                    navigator.geolocation.clearWatch(watcher);
                    watcher = null;
                }
            },
            {
                maximumAge: 0,
                enableHighAccuracy: true,
                timeout: 10000,
            }
        );
    }

    selectBooth(nameOrExternalId: string | string[]) {
        const booths = store.boothStore.booths.filter(
            (b) => nameOrExternalId.indexOf(b.name) > -1 || nameOrExternalId.indexOf(b.externalId) > -1
        );
        store.selectBooth(booths);
    }

    selectExhibitor(nameOrExternalId: string | string[]) {
        const exhibitors = store.exhibitorStore.exhibitors.filter(
            (exh) => nameOrExternalId.indexOf(exh.name) > -1 || nameOrExternalId.indexOf(exh.externalId) > -1
        );
        if (exhibitors && exhibitors.length > 0) {
            store.selectExhibitor(exhibitors[0]);
            store.moveToList([exhibitors[0]]);
        }
    }

    selectRoute(
        from: string | { x: number; y: number },
        to: string | { x: number; y: number },
        exceptUnaccessible: boolean
    ): void {
        const bFrom = store.boothStore.booths.find((b) => b.name === from) || (from as any);
        const bTo = store.boothStore.booths.find((b) => b.name === to) || (to as any);
        store.routeStore.selectRoute(new Route(bFrom, bTo, exceptUnaccessible));
    }

    selectCurrentPosition(point: CurrentPosition, focus: boolean): void {
        store.routeStore.selectCurrentPosition(point, focus);
    }

    updateLayerVisibility(layer: string, visible: boolean): void {
        store.layerStore.updateVisibility(layer, visible);
    }
}
