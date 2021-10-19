import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import FloorPlanLoader from "./floorplan.loader";
// import initStore from "./store/init";
import "./services/routing";
import store from "./store";
import Route from "./store/RouteStore";
import { GaEventActions, sendEventToGa } from "./tools/gtag";
import trackEvent from "./tools/track-event";

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
        this.resolveReady();
    }

    selectBooth(nameOrExternalId: string | string[]) {
        const booths = store.boothStore.booths.filter((b) => nameOrExternalId.indexOf(b.name) > -1 || nameOrExternalId.indexOf(b.externalId) > -1);
        store.selectBooth(booths);
    }

    selectExhibitor(nameOrExternalId: string | string[]) {
        const exhibitors = store.exhibitorStore.exhibitors.filter((exh) => nameOrExternalId.indexOf(exh.name) > -1 || nameOrExternalId.indexOf(exh.externalId) > -1);
        if(exhibitors && exhibitors.length > 0){
            store.selectExhibitor(exhibitors[0]);
            store.moveToList([exhibitors[0]]);
        }
    }

    selectRoute(from: string, to: string, exceptUnaccessible: boolean): void {
        const bFrom = store.boothStore.booths.find((b) => b.name === from || b.externalId === from) || null;
        const bTo = store.boothStore.booths.find((b) => b.name === to || b.externalId === to) || null;
        store.selectRoute(new Route(bFrom, bTo, exceptUnaccessible));
    }

    selectCurrentPosition(point: { x: number; y: number }, focus: boolean): void {
        store.selectCurrentPosition(point, focus);
    }
}
