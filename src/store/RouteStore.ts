import { action, computed, observable } from "mobx";
import store from ".";
import Rect from "../core/Rect";
import svg from "../data/svg";
import { lineLength, Point } from "./../utils/wayfinding";
import { Booth } from "./BoothStore";
import { uiState } from "./index";
import RootStore from "./RootStore";

export default class RouteStore {
    rootStore: RootStore;
    @observable routePoints: Point[] = [];
    @observable.ref position: CurrentPosition = null;
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action selectRoute(route: Route) {
        let list = [];

        if (route?.from && route?.to) this.rootStore.showMap();

        if (route?.from) list.push(route.from);
        if (route?.to) list.push(route.to);

        setTimeout(() => {
            this.rootStore.moveToList(list);
            uiState.details = route;
        }, 200);
    }

    @action clickRoute(from: Booth, to: Booth, exceptUnaccessible: boolean) {
        if (window["__resett"]) window["__resett"]();
        this.rootStore.uiState.menu = null;
        this.selectRoute(new Route(from, to, exceptUnaccessible));
        if (this.rootStore.uiState.onDirection) {
            const e: FloorPlanDirectionEvent = {
                from: undefined,
                to: undefined,
                points: [],
                distance: "",
                time: 0,
            };
            this.rootStore.uiState.onDirection(e);
        }
        //this.showMap();
    }

    @action selectCurrentPosition(point: CurrentPosition, focus: boolean) {
        this.position = point;
        if (focus) this.rootStore.uiState.moveToRect = Rect.fromCxcywh(point.x, point.y, 100, 100);
    }

    @action updateRoutePoints(routePoints: Point[]) {
        this.routePoints = routePoints;
    }

    @computed({ keepAlive: true }) get routeDistance() {
        const { from, to } = uiState.selectedRoute;
        const routePoints = this.routePoints;

        const units = svg.getAttribute("units");
        let distance = 0;

        if (!routePoints?.length) return distance;

        routePoints.forEach((element, index) => {
            if (index === 0) return;
            const prevElement = routePoints[index - 1];
            distance += lineLength(prevElement, element);
        });

        distance = distance / 10.0;

        if (store.fp.onDirection)
            setTimeout(() => {
                store.fp.onDirection({
                    from: from ? { id: from.id, name: from.name } : null,
                    to: to ? { id: to.id, name: to.name } : null,
                    points: routePoints,
                    distance: `${distance}${units}`,
                    time: Math.round(distance / 1.4),
                });
            }, 100);
        return distance;
    }

    @computed({ keepAlive: true }) get currentPosition() {
        return this.position;
    }
}

export class Route {
    public constructor(public from: Booth, public to: Booth, public exceptUnaccessible: boolean) {}
}

export class CurrentPosition {
    public x: number;
    public y: number;
    public angle: number;
}
