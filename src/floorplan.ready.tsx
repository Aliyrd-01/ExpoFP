import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import FloorPlanLoader from "./floorplan.loader";
import AdminService from "./services/AdminService";
import loadAdminServiceIfNeeded from "./services/AdminService.loader";
import EventTracker from "./services/EventTracker";
import routing from "./services/routing";
import initStore from "./store/init";
import RootStore from "./store/RootStore";
import { initGtag } from "./tools/gtag";
import validateAndFixData from "./tools/validate-and-fix-data";

export const FpContext = React.createContext<FloorPlanReady>(null);

export default class FloorPlanReady extends FloorPlanLoader {
    public readonly store: RootStore;
    public readonly adminService: AdminService;
    public readonly eventTracker: EventTracker;
    public readonly borderless: boolean = false;

    protected init(): void {
        validateAndFixData(this.data, this.eventId);
        const self = this as MutableRequired<FloorPlanReady>;
        self.eventTracker = new EventTracker(this.data.trackerUrl);
        window["__store"] = self.store = new RootStore(this);
        initGtag(this.data.gtag);
        self.borderless = this.eventId === "ktrade20";  

        loadAdminServiceIfNeeded(this).then(x => (self.adminService = x));

        // init all
        initStore(self.store);
        routing(this);

        ReactDOM.render(
            <FpContext.Provider value={this}>
                <Layout />
            </FpContext.Provider>,
            this.renderTarget
        );
        this.resolveReady();
    }

    selectBooth(name: string) {
        throw new Error("Not implemented");
        // use store to find this booth (if store is ready)
    }
}
