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

    selectBooth(name: string | string[]) {
        const booth = store.boothStore.booths.filter((b) => name.indexOf(b.name) > -1);
        store.selectBooth(booth);
    }

    selectRoute(from: string, to: string, exceptUnaccessible: boolean): void {
        const bFrom = store.boothStore.booths.find((b) => b.name === from);
        const bTo = store.boothStore.booths.find((b) => b.name === to);
        if (bFrom && bTo) store.selectRoute(new Route(bFrom, bTo, exceptUnaccessible));
    }
}
