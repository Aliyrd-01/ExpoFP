import { reaction } from "mobx";
import React from "react";
import { createRoot } from 'react-dom/client';
import { install } from "resize-observer";
import Layout from "./components/Layout";
import FloorPlanLoader from "./floorplan.loader";
import { applyParameters, destroyHistory, initRouting } from "./services/routing";
import store from "./store";
import { Booth, SpecialBooth } from "./store/BoothStore";
import { CurrentPosition, Route, findBooth, MarkersData } from "./store/RouteStore";
import { destroyUiHandlers } from "./store/init/init-ui";
import { GaEventActions, destroyGtag, sendEventToGa, setConsentSettings } from "./tools/gtag";
import reportError from "./tools/report-error";
import { resetGlobalVariables } from "./tools/reset";
import trackEvent from "./tools/track-event";
import { Visibility } from "./store/types";
import { fpGeo } from "./components/Mapbox/utils/fpGeo";
import { convertLocalToGps } from "./utils/gps";
import Rect from "./core/Rect";
import { DistanceOptimizedRoute } from "./utils/wayfinding";

install();

export default class FloorPlanReady extends FloorPlanLoader {
    root: ReturnType<typeof createRoot>;

    protected init(): void {
        initRouting(this.offHistory);
        trackEvent("load");
        store.fp = this;
        setConsentSettings(this.allowConsent);
        sendEventToGa(GaEventActions.Load, ``);
        this.root = createRoot(this.renderTarget);
        this.root.render(
            <Layout offHistory={this.offHistory} allowConsent={this.allowConsent} />,
        );
        sendEventToGa(GaEventActions.Rendered, ``);

        reaction(
            () => store.layerStore.layersLoaded,
            () => {
                this.resolveReady();

                if (!store.initialized) {
                    // this._addCustomCss();
                    this.onInit?.(this);
                }
                store.initialized = true;
            },
        );
    }

    selectBooth(nameOrExternalId: string | string[]) {
        const booths = store.boothStore.booths.filter((b) => {
            if (typeof nameOrExternalId === "string") {
                return b.name === nameOrExternalId || b.externalId === nameOrExternalId;
            }
            return nameOrExternalId.includes(b.name) || nameOrExternalId.includes(b.externalId);
        });

        store.selectBooth(booths);
    }

    selectExhibitor(nameOrExternalId: string | string[]) {
        if (!nameOrExternalId?.length) {
            store.selectSearch();
            return;
        }

        const exhibitors = store.exhibitorStore.exhibitors.filter((exh) => {
            if (typeof nameOrExternalId === "string") {
                return exh.name === nameOrExternalId || exh.externalId === nameOrExternalId;
            }
            return nameOrExternalId.includes(exh.name) || nameOrExternalId.includes(exh.externalId);
        });

        if (!exhibitors?.length) return;

        if (typeof nameOrExternalId === "string") {
            store.selectExhibitor(exhibitors[0]);
            store.moveToList([exhibitors[0]]);
            return;
        }

        const layers = exhibitors.flatMap(e => e.booths.map(b => b.layer));
        const { description: mostFrequent } = layers.reduce((acc, l) => {
            acc.freq[l.description] = (acc.freq[l.description] || 0) + 1;
            if (acc.freq[l.description] > acc.maxCount) {
                acc.maxCount = acc.freq[l.description];
                acc.mostFrequent = l;
            }
            return acc;
        }, { freq: {} as Record<string, number>, mostFrequent: layers[0], maxCount: 0 }).mostFrequent;

        store.layerStore.updateVisibility(mostFrequent, true, true);

        store.uiState.menu = false;
        store.uiState.details = null;

        store.uiState.list = {
            type: "filter",
            items: exhibitors,
            query: { key: "exhibitors", value: exhibitors.map((e) => e.externalId).join(",") },
        };

        store.moveToList();
    }

    highlightExhibitors(externalIds: string[]) {
        store.boothStore.highlightedByExternalIds = [];
        store.exhibitorStore.highlightedByExternalIds = [...externalIds];
    }

    highlightBooths(externalIds: string[]) {
        store.exhibitorStore.highlightedByExternalIds = [];
        store.boothStore.highlightedByExternalIds = [...externalIds];
    }

    selectRoute(startOrWaypoints: RouteWaypoint | RouteWaypoint[], to?: RouteWaypoint): void {
        if (Array.isArray(startOrWaypoints)) {
            let points = [...startOrWaypoints];
            const from = points.shift();
            const to = points.pop();


            const limit = 98;
            if (points.length > limit) {
                points = points.slice(0, limit);
                console.warn(`The maximum number of waypoints is ${limit}. All waypoints beyond this limit have been ignored.`);
            }

            if (!from || !to) {
                throw new Error(
                    "Invalid route format: When providing an array, it must include at least two points: a start and a destination."
                );
            }

            store.routeStore.selectRoute(new Route(getBooth(from), getBooth(to), points.map(getBooth)));
            return;
        }

        store.routeStore.selectRoute(new Route(getBooth(startOrWaypoints), getBooth(to)));
    }

    getOptimizedRoutes(waypoints: RouteWaypoint[]): RouteInfo[] {
        const booths = waypoints.map(getBooth).filter((booth): booth is Booth => Boolean(booth));

        if (!booths.length) {
            return waypoints;
        }

        const grouped = booths.reduce((map, booth) => {
            const layerName = booth.layer?.name;
            if (layerName) {
                if (!map.has(layerName)) {
                    map.set(layerName, new Set<Booth>());
                }
                map.get(layerName)!.add(booth);
            }
            return map;
        }, new Map<string, Set<Booth>>());

        let sortedWaypoints: RouteWaypoint[] = waypoints;

        if (grouped.size) {
            sortedWaypoints = Array.from(grouped.values(), boothsSet =>
                new DistanceOptimizedRoute(Array.from(boothsSet, booth => [booth.name, booth.rect])),
            ).flatMap(route => route.waypoints);
        } else {
            sortedWaypoints = new DistanceOptimizedRoute(booths.map(booth => [booth.name, booth.rect])).waypoints
        }

        return [{ waypoints: sortedWaypoints }];
    }    

    selectCurrentPosition(point: CurrentPosition, focus: boolean, icon?: number): void {
        if (point?.angle != null && fpGeo?.properties?.bearing != null) {
            point.angle = 90.0 + fpGeo.properties.bearing - (point.angle % 360.0);
            point.angle = point.angle < 0 ? point.angle + 360.0 : point.angle;
            point.angle = point.angle > 360 ? point.angle - 360.0 : point.angle;
        }

        store.routeStore.selectCurrentPosition(point, focus, icon);
        this.onCurrentPositionChanged?.(point);
    }

    setBookmarks(bookmarks: { name?: string; externalId?: string; bookmarked: boolean }[]): void {
        bookmarks.forEach((b) => {
            const e = store.exhibitorStore.exhibitors.find((e) => e.name === b.name || e.externalId === b.externalId);
            if (e) e.bookmarked = b.bookmarked;
        });
    }

    setMarkers(markersData: MarkersData): void {
        store.routeStore.setMarkers(markersData);
    }

    selectMarker(id: string, focus = true): void {
        store.routeStore.selectMarker(id, focus);
    }

    drawCircles(circles: { x: number; y: number; radius: number; color?: string }[]) {
        store.uiState.debugCircles = circles;
    }

    checkRoutes(): void {
        store.routeStore.checkRoutes();
    }

    updateLayerVisibility(layer: string, visible: boolean): void {
        store.layerStore.updateVisibility(layer, visible);
    }

    getCenterCoordinates(): FloorPlanGetCoordsEvent {
        return store.fp.getCenterCoordinates();
    }

    exhibitorsList(): any {
        return store.exhibitorStore.exhibitors.map((e) => {
            return {
                id: e.id,
                name: e.name,
                externalId: e.externalId,
                booths: e.booths.map((b) => b.id),
            };
        });
    }

    boothsList(): FloorPlanBooth[] {
        return store.boothStore.booths.map((b) => {
            return {
                id: b.id,
                name: b.name,
                externalId: b.externalId,
                isSpecial: b instanceof SpecialBooth,
                exhibitors: b.exhibitors.map((e) => e.id),
                layer: {
                    name: b.layer?.name,
                    description: b.layer?.description,
                },
                meta: b.meta,
                description: b.description || "",
            };
        });
    }

    categoriesList(): any {
        return store.categoryStore.categories.map((c) => {
            return {
                id: c.id,
                name: c.name,
                exhibitors: c.exhibitors.map((e) => e.id),
            };
        });
    }

    selectCategory(nameOrSlug?: string) {
        if (nameOrSlug == null || typeof nameOrSlug !== "string") {
            store.selectSearch();
            return;
        }

        const str = nameOrSlug?.toLowerCase();
        const category = store.categoryStore.categories.find(
            ({ name, slug }) => name?.toLowerCase() === str || slug?.toLowerCase() === str,
        );

        if (!category) {
            console.error(`Category ${nameOrSlug} not found.`);
            return;
        }
            store.selectCategory(category)
    }

    applyParameters(queryRaw: string) {
        applyParameters(queryRaw);
    }

    getVisibility(): Visibility {
        return store.uiState.visibility;
    }

    setVisibility(visibility: Visibility): void {
        store.uiState.setVisibility(visibility);
    }

    findLocation(): void {
        store.routeStore.findLocation();
    }

    zoomIn(): void {
        store.uiState.zoomIn();
    }

    zoomOut(): void {
        store.uiState.zoomOut();
    }

    switchView(): void {
        store.mapboxStore.activateMapbox();
    }

    fitBounds(): void {
        store.uiState.fitBounds();
    }

    getBoothRect(name: string): Rect {
        return findBooth(name)?.rect;
    }

    convertToGeo(x: number, y: number): [number, number] | never {
        if (!fpGeo?.properties?.config) {
            throw new Error("The coordinates cannot be converted because the GPS configuration is not defined.");
        }
        return convertLocalToGps(x, y, fpGeo.properties.config);
    }

    unstable_destroy() {
        let efpElement = window["__efpElement"].firstChild;
        resetGlobalVariables();

        window.removeEventListener("__efpStyleLoad", this.efpStyleLoadHandler);
        window.removeEventListener("error", reportError);
        destroyHistory();
        destroyUiHandlers();
        destroyGtag();

        const scripts = [...document.getElementsByTagName("script")].filter(
            (x) => x.src.indexOf("/fp.svg") > -1 || x.src.indexOf("/wf.data.js") > -1 || x.src.indexOf("/data.js") > -1,
        );
        scripts.forEach((sc) => sc.remove());

        this.root.unmount();
        efpElement.remove();
    }

    search(term: string): Promise<unknown> {
        return new Promise(resolve => {
            store.selectSearch(term);
            resolve(store.uiState.listItems);
        });
    }
}

function getBooth(x: RouteWaypoint) {
    return typeof x === "string" ? findBooth(x) : store.routeStore.getNearestBooth(x);
}
