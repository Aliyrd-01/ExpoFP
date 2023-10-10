import { action, computed, observable } from "mobx";
import { lineLength, Point } from "simple-geometry";
import store, { layersStore } from ".";
import { mapCurrentPosition } from "../components/Map/drawing/config/config-wf";
import Rect from "../core/Rect";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import { getLayerSvg, svgArea } from "./../data/svg";
import { RouteLine, sublines } from "./../utils/wayfinding";
import { Booth } from "./BoothStore";
import { uiState } from "./index";
import { Layer, LayersMode } from "./LayerStore";
import RootStore from "./RootStore";

export default class RouteStore {
    rootStore: RootStore;
    cpTimeout: number;
    @observable routeLines: RouteLine[] = [];
    @observable routeDistance: number = null;
    @observable currentPosition: CurrentPosition = null;
    @observable iconType: number = 0;
    @observable tempToBooth: Booth = null;
    @observable defaultFrom: Booth = null;
    @observable focusEnabled: boolean = true;
    @observable prevZ: string = null;

    @observable showAccessible: boolean = !!sublines()?.lines?.find((l) => l.unaccessible);
    @observable onlyAccessible: boolean = false;
    @observable currentRouteLayer: Layer = null;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.focusEnabled = !window.location.search;
    }

    @action selectRoute(route: Route) {
        if (!route?.from && route?.to && this.currentPosition) route.from = this.nearestBooth;
        if (route?.from && route?.to && route.from === route.to) route = null;
        let list = [];

        if (route?.from && route?.to)
            window.setTimeout(
                () => {
                    this.rootStore.showMap();
                },
                navigator.userAgent.toLowerCase().indexOf("android") > -1 ? 400 : 50
            );

        if (route?.from?.visible) list.push(route.from);
        if (route?.to?.visible) {
            this.tempToBooth = null;
            list.push(route.to);
        }

        if (!route && store.fp.onDirection) store.fp.onDirection(null);

        setTimeout(() => {
            this.rootStore.moveToList(list);
            var id = uiState.selectedRoute?.from?.id;
            uiState.details = route;
            if (route && (!route.from || !route.to)) store.showOverlay();
            if (route?.to && route?.from?.layer && !route?.from?.visible && id !== route?.from?.id)
                this.rootStore.layerStore.updateVisibility(route.from.layer.name, true);

            if (route?.from?.layer) this.currentRouteLayer = route?.from?.layer;
        }, 200);
    }

    @computed({ keepAlive: true }) get nearestBooth() {
        if (!this.currentPosition) return null;
        let layerExists = this.rootStore.layerStore.findLayer(this.currentPosition.z);

        return (
            this.rootStore.boothStore.booths
                .filter((b) => {
                    if (layersStore.mode === LayersMode.Default || !layerExists) {
                        return b.visible && b.rect;
                    } else {
                        return b.rect && ((!this.currentPosition.z && b.visible) || layerExists.name === b.layer?.name);
                    }
                })
                .sort(
                    (b1, b2) =>
                        lineLength(this.currentPosition, { x: b1.rect.cx, y: b1.rect.cy }) -
                        lineLength(this.currentPosition, { x: b2.rect.cx, y: b2.rect.cy })
                )[0] || null
        );
    }

    @computed({ keepAlive: true }) get layers(): Layer[] {
        var layers: string[] = [];
        store.routeStore.routeLines
            ?.map((rl) => rl.p0.layer)
            .reverse()
            .forEach((l) => {
                if (layers.indexOf(l) === -1) layers.push(l);
            });

        return layers.map((l) => store.layerStore.layers.find((layer) => layer.name === l));
    }

    @action clickRoute(from: Booth, to: Booth) {
        if (window["__resett"]) window["__resett"]();
        this.rootStore.uiState.menu = null;
        this.selectRoute(new Route(this.defaultFrom || from, to));

        // if (this.rootStore.uiState.onDirection) {
        //     const e: FloorPlanDirectionEvent = {
        //         from: undefined,
        //         to: undefined,
        //         lines: [],
        //         distance: "",
        //         time: 0,
        //     };
        //     this.rootStore.uiState.onDirection(e);
        // }

        //this.showMap();
    }

    @action selectCurrentPosition(point: CurrentPosition, focus: boolean, icon?: number) {
        clearTimeout(this.cpTimeout);

        const replaceCommasWithDot = (value: string | number | undefined) => {
            if (typeof value === "string") {
                return Number(value.replace(",", "."));
            }
            return value;
        };

        point.x = replaceCommasWithDot(point.x);
        point.y = replaceCommasWithDot(point.y);
        point.lat = replaceCommasWithDot(point.lat);
        point.lng = replaceCommasWithDot(point.lng);

        focus = true; // Temp always "true" SDK compatility

        focus = focus && (this.focusEnabled || this.prevZ != point?.z);
        if (this.focusEnabled) this.focusEnabled = false;
        this.prevZ = point?.z?.toString();

        this.iconType = icon ? 1 : 0;
        const p = point ? mapCurrentPosition(point) : null;
        if (!p) {
            this.currentPosition = null;
            return;
        }

        let layer = store.layerStore.findLayer(point.z);

        if (focus) {
            if (layer && !layer?.visible) layersStore.updateVisibility(layer.name, true);
            this.rootStore.uiState.moveToRect = Rect.fromCxcywh(p.x, p.y, 1000, 1000);
        }

        this.currentPosition = p;

        this.cpTimeout = setTimeout(() => {
            if (this.currentPosition) this.selectCurrentPosition(null, false);
        }, 30 * 1000) as any;
    }

    @action findLocation() {
        if (store.mapboxStore.showMapbox) {
            uiState.moveToLocation = true;
            return;
        }

        if (store.routeStore.currentPosition) {
            const cp = store.routeStore.currentPosition;

            const rect = Rect.fromCxcywh(cp.x, cp.y, 1000, 1000);
            if (!rect.intersects(svgArea)) return;

            uiState.moveToRect = rect;

            const layer = store.layerStore.findLayer(store.routeStore.currentPosition?.z);
            layersStore.updateVisibility(layer.name, true);
        } else store.selectBooth(store.routeStore.defaultFrom);
    }

    @action updateRoutePoints(routeLines: RouteLine[]) {
        if (!routeLines?.length && !this.routeLines.length) return;

        this.routeLines = routeLines;

        const route = uiState.selectedRoute;

        const units = getLayerSvg().getAttribute("units");
        let distance = 0;

        routeLines.forEach((line) => (distance += lineLength(line.p0, line.p1)));

        distance = Math.round(distance / 10.0);

        sendEventToGa(
            GaEventActions.ClickDirections,
            `${route?.from ? "From " + route.from.name : ""} ${route?.to ? "To " + route.to.name : ""}`
        );

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
    public constructor(public from: Booth, public to: Booth) {}
}

export class CurrentPosition extends Point {
    public constructor(
        public x: number,
        public y: number,
        public z?: number | string,
        public angle?: number,
        public lat?: number,
        public lng?: number
    ) {
        super(x, y);
    }
}
