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
import AdminService from "./services/AdminService";
import loadAdminServiceIfNeeded from "./services/AdminService.loader";

trackEvent("load");
// initStore(store);

// export default function renderFloorPlan(el: Element) {
//     ReactDOM.render(<Layout />, el);
// }

export const FpContext = React.createContext<FloorPlanReady>(null);

export default class FloorPlanReady extends FloorPlanLoader {
    public readonly store: RootStore;
    public readonly adminService: AdminService;
    // constructor(options: FloorPlanOptions) {
    //     super(options);
    // }
    protected init(): void {
        const store = new RootStore(this);
        window["__store"] = store;
        const self = this as MutableRequired<FloorPlanReady>;
        self.store = store;
        loadAdminServiceIfNeeded(this).then(x => (self.adminService = x));

        // init all
        initStore(store);
        routing(store);

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

fp is a service container

fp.store
fp.router
fp.adminService -> should be non-empty when token provided (give it is valid)
fp.

if there's something that affects UI -> it should be part of store

so let's go from UI to bottom
Booth -> should have a list of exhibitors -> taken from store
Booth should have 

actions that modify store in transaction -> should be part of store



*/
