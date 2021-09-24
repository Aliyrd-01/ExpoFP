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

    //onBoothClick: (e: FloorPlanBoothClickEvent) => void;

    selectBooth(name: string) {
        const booth = store.boothStore.booths.find((b) => b.name === name);
        if (booth) store.selectBooth(booth);
    }

    selectRoute(from: string, to: string): void {
        const bFrom = store.boothStore.booths.find((b) => b.name === from);
        const bTo = store.boothStore.booths.find((b) => b.name === to);
        if (bFrom && bTo) store.selectRoute(new Route(bFrom, bTo));
    }
}
