import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import FloorPlanLoader from "./floorplan.loader";
// import initStore from "./store/init";
import routing from "./services/routing";
import initStore from "./store/init";
import RootStore from "./store/RootStore";
// import store from "./store";
import trackEvent from "./tools/track-event";

trackEvent("load");
// initStore(store);

// export default function renderFloorPlan(el: Element) {
//     ReactDOM.render(<Layout />, el);
// }

export const FpContext = React.createContext<FloorPlanReady>(null);

export default class FloorPlanReady extends FloorPlanLoader {
    public readonly store: RootStore;
    // constructor(options: FloorPlanOptions) {
    //     super(options);
    // }
    protected init(): void {
        // TODO: initialize the store here
        const store = new RootStore(this);
        window["__store"] = store;
        initStore(store);

        // store.fp = this;
        const self = this as MutableRequired<FloorPlanReady>;
        self.store = store;
        routing(store);
        // store to be initialized there already

        ReactDOM.render(
            <FpContext.Provider value={this}>
                <Layout />
            </FpContext.Provider>,
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

/*
initialization sequence
create fp
create store, init store (pass fp there)
create routing service (pass store)
create logger (pass fp)

fp.logger
fp.router
fp.store
fp.uiState


fp is a container then - it initializes all
fp has some settings - used by store


all actions are on rootstore level
uistate contains derivatives from fp (like copmuted things, etc)
fp itselves serves as a public API

components can const {uiState} = useFloorplan();


transition to this:
replace global imports of store with useStore, useUIState


*/
