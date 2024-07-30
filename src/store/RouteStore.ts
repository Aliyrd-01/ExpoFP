import { action, computed, observable } from "mobx";
import { Point, lineLength } from "simple-geometry";
import store, { layersStore } from ".";
import { mapCurrentPosition } from "../components/Map/drawing/config/config-wf";
import Rect from "../core/Rect";
import { GaEventActions, sendEventToGa } from "../tools/gtag";
import { getLayerSvg, svgArea } from "./../data/svg";
import { RouteLine, getGraphLines, sublines } from "./../utils/wayfinding";
import { Booth } from "./BoothStore";
import { Layer, LayersMode } from "./LayerStore";
import RootStore from "./RootStore";
import { uiState } from "./index";

const replaceCommasWithDot = (value: string | number | undefined) => {
    if (typeof value === "string") {
        return Number(value.replace(",", "."));
    }
    return value;
};

export interface MarkerIcon {
    name: string,
    content: string,
    width: number,
    height: number
}

export interface MarkersData {
    icons: MarkerIcon[],
    markers: Marker[]
}

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
    @observable markersData: MarkersData = { icons: [], markers: [] };
    @observable prevMarkers: Marker[] = [];

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
                this.rootStore.layerStore.updateVisibility(route.from.layer, true);

            if (route?.from?.layer) this.currentRouteLayer = route?.from?.layer;

            if (route?.from && route?.to)
                sendEventToGa(
                    GaEventActions.ClickDirections,
                    `${route?.from ? "From " + route.from.name : ""} ${route?.to ? "To " + route.to.name : ""}`
                );
        }, 200);
    }

    @computed({ keepAlive: true }) get pathLayers() {
        const layers: {id: number, name: string}[] = [];
        store.routeStore.routeLines
            ?.map((rl) => rl.p0.layer)
            .reverse()
            .forEach((l, index, array) => {
                if (index === 0 || l !== array[index - 1]) {
                    layers.push({ id: index + 1, name: l });
                }
            });

        return layers.map((l) => {
            return {
                id: l.id,
                layer: store.layerStore.layers.find((layer) => layer.name === l.name)
            }
        } );
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

    @action setMarkers(data: MarkersData) {
        this.markersData.markers = data.markers.map(dot => {
            dot.x = replaceCommasWithDot(dot.x);
            dot.y = replaceCommasWithDot(dot.y);
            dot.lat = replaceCommasWithDot(dot.lat);
            dot.lng = replaceCommasWithDot(dot.lng);
            dot.position = dot.position || "centertop";
            return dot;
        });
        this.markersData.icons = data.icons;
    }

    @action selectMarker(id: string, focus: boolean) {
        const marker = this.markersData.markers.find(marker => marker.id === id);
        this.markersData.markers.forEach(marker => marker.active = false);

        if (marker) {
            marker.active = true;
        }

        let layer = store.layerStore.findLayer(marker?.z);

        if (focus) {
            if (layer && !layer?.visible) layersStore.updateVisibility(layer, true);
            this.rootStore.uiState.moveToRect = Rect.fromCxcywh(marker?.x, marker?.y, 1000, 1000);
        }
    }

    @computed({ keepAlive: true }) get selectedMarkers() {
        return this.markersData.markers.filter(marker => marker.active);
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

        if (point) {
            point.x = replaceCommasWithDot(point.x);
            point.y = replaceCommasWithDot(point.y);
            point.lat = replaceCommasWithDot(point.lat);
            point.lng = replaceCommasWithDot(point.lng);
        }

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
            if (layer && !layer?.visible) layersStore.updateVisibility(layer, true);
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
            if (layer) {
                layersStore.updateVisibility(layer, true);
            }
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

        if (store.fp.onDirection)
            setTimeout(() => {
                store.fp.onDirection({
                    from: route?.from
                        ? {
                              id: route.from.id,
                              name: route.from.name,
                              layer: { name: route.from?.layer?.name, description: route.from?.layer?.description },
                          }
                        : null,
                    to: route?.to
                        ? {
                              id: route.to.id,
                              name: route.to.name,
                              layer: { name: route.to.layer?.name, description: route.to.layer?.description },
                          }
                        : null,
                    lines: routeLines,
                    distance: `${distance}${units}`,
                    time: Math.round(distance / 1.4),
                });
            }, 100);

        this.routeDistance = distance;
    }

    @action checkRoutes() {
        let booths = store.boothStore.booths;

        console.info(`Route check started  ${booths.length}.... `);

        for (let i = 0; i < booths.length; i++) {
            const from = booths[i];
            for (let j = i + 1; j < booths.length; j++) {
                const to = booths[j];
                const route = getGraphLines(from, to);
                if (!route.length) {
                    console.warn(`No route found from ${from.name} to ${to.name}`);
                } else {
                    //console.info(`Route found from ${from.name} to ${to.name}`);
                }
            }
        }

        console.info("Route check done....");
    }
}

export function extractRoute(from: string, to: string) {
    let bFrom = store.boothStore.booths.find((b) => b.name === from || b.slug === from || b.externalId === from);
    if (!bFrom)
        bFrom = store.exhibitorStore.exhibitors.find((e) => e.name === from || e.slug === from || e.externalId === from)
            ?.booths[0];

    let bTo = store.boothStore.booths.find((b) => b.name === to || b.slug === to || b.externalId === to);
    if (!bTo) bTo = store.exhibitorStore.exhibitors.find((e) => e.name === to || e.slug === to || e.externalId === to)?.booths[0];

    return new Route(bFrom, bTo);
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

export interface Marker extends CurrentPosition {
    id: string;
    icon: string,
    selectedIcon: string,
    position: "centertop" | "lefttop",
    active?: boolean;
}