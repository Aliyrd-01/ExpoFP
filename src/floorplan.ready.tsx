import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import FloorPlanLoader from "./floorplan.loader";
// import initStore from "./store/init";
import "./services/routing";
import store from "./store";
import trackEvent from "./tools/track-event";

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
        throw new Error("Not implemented");
        // use store to find this booth (if store is ready)
    }
}
