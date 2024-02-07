import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import FloorPlanLoader from "./floorplan.loader";
import { install } from "resize-observer";
// import initStore from "./store/init";
import { initRouting, destroyHistory } from "./services/routing";
import store from "./store";
import { CurrentPosition, Route, extractRoute } from "./store/RouteStore";
import { GaEventActions, sendEventToGa, setConsentSettings } from "./tools/gtag";
import trackEvent from "./tools/track-event";
import { resetGlobalVariables } from "./tools/reset";
import reportError from "./tools/report-error";
import { destroyUiHandlers } from "./store/init/init-ui";
import { destroyGtag } from "./tools/gtag";
import { SpecialBooth } from "./store/BoothStore";

install();

trackEvent("load");

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
        initRouting(this.offHistory);
        store.fp = this;
        setConsentSettings(this.allowConsent);
        sendEventToGa(GaEventActions.Load, ``);
        ReactDOM.render(
            // <FpContext.Provider value={this}>
            <Layout offHistory={this.offHistory} allowConsent={this.allowConsent} />,
            // </FpContext.Provider>,
            this.renderTarget
        );
        sendEventToGa(GaEventActions.Rendered, ``);
        this.resolveReady();
    }

    selectBooth(nameOrExternalId: string | string[]) {
        const booths = store.boothStore.booths.filter((b) => {
            if (typeof nameOrExternalId === "string") {
                return b.name === nameOrExternalId || b.externalId === nameOrExternalId;
            }
            return nameOrExternalId.includes(b.name) || nameOrExternalId.includes(b.externalId);
        });

        store.selectBooth(booths);
    }

    selectExhibitor(nameOrExternalId: string | string[]) {
        const exhibitors = store.exhibitorStore.exhibitors.filter((exh) => {
            if (typeof nameOrExternalId === "string") {
                return exh.name === nameOrExternalId || exh.externalId === nameOrExternalId;
            }
            return nameOrExternalId.includes(exh.name) || nameOrExternalId.includes(exh.externalId);
        });

        if (exhibitors && exhibitors.length > 0) {
            store.selectExhibitor(exhibitors[0]);
            store.moveToList([exhibitors[0]]);
        }
    }

    selectRoute(from: string | { x: number; y: number }, to: string | { x: number; y: number }): void {
        if (typeof from === "string" && typeof to === "string") store.routeStore.selectRoute(extractRoute(from, to));
        else store.routeStore.selectRoute(new Route(from as any, to as any));
    }

    selectCurrentPosition(point: CurrentPosition, focus: boolean, icon?: number): void {
        store.routeStore.selectCurrentPosition(point, focus, icon);
    }

    checkRoutes(): void {
        store.routeStore.checkRoutes();
    }

    updateLayerVisibility(layer: string, visible: boolean): void {
        store.layerStore.updateVisibility(layer, visible);
    }

    exhibitorsList(): any {
        return store.exhibitorStore.exhibitors.map((e) => {
            return {
                id: e.id,
                name: e.name,
                externalId: e.externalId,
                booths: e.booths.map((b) => b.id),
            };
        });
    }

    boothsList(): any {
        return store.boothStore.booths.map((b) => {
            return {
                id: b.id,
                name: b.name,
                externalId: b.externalId,
                isSpecial: b instanceof SpecialBooth,
                exhibitors: b.exhibitors.map((e) => e.id),
            };
        });
    }

    categoriesList(): any {
        return store.categoryStore.categories.map((c) => {
            return {
                id: c.id,
                name: c.name,
                exhibitors: c.exhibitors.map((e) => e.id),
            };
        });
    }

    unstable_destroy() {
        let efpElement = window["__efpElement"].firstChild;
        resetGlobalVariables();

        window.removeEventListener("__efpStyleLoad", this.efpStyleLoadHandler);
        window.removeEventListener("error", reportError);
        destroyHistory();
        destroyUiHandlers();
        destroyGtag();

        ReactDOM.unmountComponentAtNode(this.renderTarget);
        efpElement.remove();
    }
}
