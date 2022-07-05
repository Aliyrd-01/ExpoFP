import { RouteLine } from "./../utils/wayfinding";
import { getLayerSvg } from "./../data/svg";
import { action, computed, observable } from "mobx";
import { lineLength, Point } from "simple-geometry";
import store from ".";
import { mapCurrentPosition } from "../components/Map/drawing/config/config-wf";
import Rect from "../core/Rect";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import { Booth } from "./BoothStore";
import { uiState } from "./index";
import RootStore from "./RootStore";

export default class RouteStore {
    rootStore: RootStore;
    @observable routeLines: RouteLine[] = [];
    @observable routeDistance: number = null;
    @observable currentPosition: CurrentPosition = null;
    @observable tempToBooth: Booth = null;
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action selectRoute(route: Route) {
        if (!route?.from && route?.to && this.currentPosition) route.from = this.nearestBooth;

        let list = [];

        if (route?.from && route?.to)
            window.setTimeout(
                () => {
                    this.rootStore.showMap();
                },
                navigator.userAgent.toLowerCase().indexOf("android") > -1 ? 400 : 50
            );

        if (route?.from?.layer.visible) list.push(route.from);
        if (route?.to?.layer.visible) {
            this.tempToBooth = null;
            list.push(route.to);
        }

        setTimeout(() => {
            this.rootStore.moveToList(list);
            var id = uiState.selectedRoute?.from?.id;
            uiState.details = route;
            if (route && (!route.from || !route.to)) store.showOverlay();
            if (route?.to && route?.from && !route?.from?.layer.visible && id !== route?.from?.id)  
                this.rootStore.layerStore.updateVisibility(route.from.layer.name, true);
        }, 200);
    }

    @computed({ keepAlive: true }) get nearestBooth() {
        if (!this.currentPosition) return null;
        return (
            this.rootStore.boothStore.booths.sort(
                (b1, b2) =>
                    lineLength(this.currentPosition, { x: b1.rect.cx, y: b1.rect.cy }) -
                    lineLength(this.currentPosition, { x: b2.rect.cx, y: b2.rect.cy })
            )[0] || null
        );
    }

    @action clickRoute(from: Booth, to: Booth, exceptUnaccessible: boolean) {
        if (window["__resett"]) window["__resett"]();
        this.rootStore.uiState.menu = null;
        this.selectRoute(new Route(from, to, exceptUnaccessible));
        sendEventToGa(`FP Wayfinding`, GaEventActions.ClickDirections, to.name);
        if (this.rootStore.uiState.onDirection) {
            const e: FloorPlanDirectionEvent = {
                from: undefined,
                to: undefined,
                lines: [],
                distance: "",
                time: 0,
            };
            this.rootStore.uiState.onDirection(e);
        }
        //this.showMap();
    }

    @action selectCurrentPosition(point: CurrentPosition, focus: boolean) {
        const p = mapCurrentPosition(point);
        this.currentPosition = p;
        if (focus) this.rootStore.uiState.moveToRect = Rect.fromCxcywh(p.x, p.y, 100, 100);
    }

    @action updateRoutePoints(routeLines: RouteLine[]) {
        if (!routeLines?.length && !this.routeLines.length) return;

        this.routeLines = routeLines;

        const route = uiState.selectedRoute;

        const units = getLayerSvg().getAttribute("units");
        let distance = 0;

        routeLines.forEach((line) => (distance += lineLength(line.p0, line.p1)));

        distance = Math.round(distance / 10.0);

        if (store.fp.onDirection)
            setTimeout(() => {
                store.fp.onDirection({
                    from: route?.from ? { id: route.from.id, name: route.from.name } : null,
                    to: route?.to ? { id: route.to.id, name: route.to.name } : null,
                    lines: routeLines,
                    distance: `${distance}${units}`,
                    time: Math.round(distance / 1.4),
                });
            }, 100);

        this.routeDistance = distance;
    }
}

export class Route {
    public constructor(public from: Booth, public to: Booth, public exceptUnaccessible: boolean) {}
}

export class CurrentPosition extends Point {
    public constructor(
        public x: number,
        public y: number,
        public z?: string,
        public angle?: number,
        public lat?: number,
        public lng?: number
    ) {
        super(x, y);
    }
}
