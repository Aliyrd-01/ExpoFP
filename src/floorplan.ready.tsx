import { reaction } from "mobx";
import React from "react";
import ReactDOM from "react-dom";
import { install } from "resize-observer";
import Layout from "./components/Layout";
import FloorPlanLoader from "./floorplan.loader";
// import initStore from "./store/init";
import { applyParameters, destroyHistory, initRouting } from "./services/routing";
import store from "./store";
import { RegularBooth, SpecialBooth } from "./store/BoothStore";
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
import { Exhibitor } from "./store/ExhibitorStore";

install();

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
        initRouting(this.offHistory);
        trackEvent("load");
        store.fp = this;
        setConsentSettings(this.allowConsent);
        sendEventToGa(GaEventActions.Load, ``);
        ReactDOM.render(
            // <FpContext.Provider value={this}>
            <Layout offHistory={this.offHistory} allowConsent={this.allowConsent} />,
            // </FpContext.Provider>,
            this.renderTarget,
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

    private exhibitorNameOrExternalId: string | string[] = [];

    selectExhibitor(nameOrExternalId: string | string[]) {
        if (!nameOrExternalId?.length) {
            store.selectSearch();

            this.highlightExhibitors(
                store.exhibitorStore.exhibitors
                    .filter(
                        e => e.booths.filter(b => b.isHighlighted).length
                            && (
                                Array.isArray(this.exhibitorNameOrExternalId)
                                    ? !this.exhibitorNameOrExternalId.includes(e.externalId)
                                    : e.externalId !== this.exhibitorNameOrExternalId
                            ),
                    )
                    .map(e => e.externalId)
            );

            return;
        }

        const exhibitors = store.exhibitorStore.exhibitors.filter((exh) => {
            if (typeof nameOrExternalId === "string") {
                return exh.name === nameOrExternalId || exh.externalId === nameOrExternalId;
            }
            return nameOrExternalId.includes(exh.name) || nameOrExternalId.includes(exh.externalId);
        });

        if (!exhibitors?.length) return;

        this.exhibitorNameOrExternalId = nameOrExternalId;

        this.highlightExhibitors([
            ...store.exhibitorStore.exhibitors
                .filter(e => e.booths.filter(b => b.isHighlighted).length)
                .map(e => e.externalId),

            ...(Array.isArray(nameOrExternalId) ? nameOrExternalId : [nameOrExternalId]),
        ]);

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

    selectRoute(from: string | CurrentPosition, to: string | CurrentPosition): void {
        store.routeStore.selectRoute(
            new Route(
                typeof from === "string" ? findBooth(from) : store.routeStore.getNearestBooth(from),
                typeof to === "string" ? findBooth(to) : store.routeStore.getNearestBooth(to),
            ),
        );
    }

    selectCurrentPosition(point: CurrentPosition, focus: boolean, icon?: number): void {
        store.routeStore.selectCurrentPosition(point, focus, icon);
    }

    setBookmarks(bookmarks: { name: string; bookmarked: boolean }[]): void {
        bookmarks.forEach((b) => {
            const e = store.exhibitorStore.exhibitors.find((e) => e.name === b.name);
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

        ReactDOM.unmountComponentAtNode(this.renderTarget);
        efpElement.remove();
    }

    highlightExhibitors(externalIs: string[]) {
        const externalIsSet = new Set(externalIs);

        const highlightedBoothIds = new Set(
            store.exhibitorStore.exhibitors
                .filter(e => externalIsSet.has(e.externalId))
                .flatMap(e => e.booths.filter(b => b instanceof RegularBooth))
                .map(b => b.id),
        );

        store.uiState.forcedDimming = highlightedBoothIds.size > 0;

        store.boothStore.booths.forEach(b => {
            b.isHighlighted = highlightedBoothIds.has(b.id);
        });

        // TODO: Do we need this?
        // store.moveToList(exhibitors);
    }
}
