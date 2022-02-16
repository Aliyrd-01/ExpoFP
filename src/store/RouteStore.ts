import { action, computed, observable } from "mobx";
import { Line, lineLength } from "simple-geometry";
import store from ".";
import Rect from "../core/Rect";
import svg from "../data/svg";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import { Booth } from "./BoothStore";
import { uiState } from "./index";
import RootStore from "./RootStore";

export default class RouteStore {
    rootStore: RootStore;
    @observable routeLines: Line[] = [];
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
                () => this.rootStore.showMap(),
                navigator.userAgent.toLowerCase().indexOf("android") > -1 ? 400 : 50
            );

        if (route?.from) list.push(route.from);
        if (route?.to) {
            this.tempToBooth = null;
            list.push(route.to);
        }

        setTimeout(() => {
            this.rootStore.moveToList(list);
            uiState.details = route;
            if (route && (!route.from || !route.to)) store.showOverlay();
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
        this.currentPosition = point;
        if (focus) this.rootStore.uiState.moveToRect = Rect.fromCxcywh(point.x, point.y, 100, 100);
    }

    @action updateRoutePoints(routeLines: Line[]) {
        if (!routeLines?.length && !this.routeLines.length) return;

        this.routeLines = routeLines;

        const route = uiState.selectedRoute;

        const units = svg.getAttribute("units");
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

export class CurrentPosition {
    public constructor(public x: number, public y: number, public angle: number) {}
}
