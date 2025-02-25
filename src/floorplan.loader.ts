import { PREVIEW_MODE_ATTRIBUTE } from "./constants";
import { Data } from "./data/Data";
import { initOfflineManager } from "./offline/offlineManager";
import { CurrentPosition, MarkersData } from "./store/RouteStore";
import { Visibility } from "./store/types";
import baseUrl from "./tools/base-url";
import { buildRebookingUrl, getRebookingToken, retainRebookingToken } from "./tools/rebookingUrl";
import { loadCss, loadCustomFonts, loadFont, loadJs } from "./tools/loaders";
import logger from "./tools/logger";
import { sleep } from "./utils";
import { initI18n } from "./utils/i18n";
import isWebview from "./utils/is-webview";
import { loadImage } from "./utils/loadImage";
import mergeExhibitors from "./utils/mergeExhibitors";
import useShadow from "./utils/use-shadow";

function nr(): never {
    throw new Error("FloorPlan not ready");
}

export default class FloorPlanLoader implements FloorPlan {
    protected readonly options: FloorPlanOptions;
    protected readonly renderTarget: HTMLDivElement;
    private readonly _ready: Promise<void>;
    // exposed vals
    readonly element: HTMLDivElement;
    readonly eventId: string;
    readonly dataUrl: string;
    readonly noOverlay: boolean;
    readonly offHistory: boolean;
    readonly allowConsent: boolean | undefined;
    readonly onInit: (fp: FloorPlan) => void;

    protected efpStyleLoadHandler: (e: Event) => void;
    protected resolveReady: () => void;

    public readonly icons = new Map<FloorPlanIcon, HTMLImageElement>();

    get ready() {
        return this._ready;
    }

    get previewMode() {
        return this.options.previewMode || this.element.hasAttribute(PREVIEW_MODE_ATTRIBUTE);
    }

    // options
    onBoothClick: (e: FloorPlanBoothClickEvent) => void;

    onBookmarkClick: (e: FloorPlanBookmarkClickEvent) => void;

    onCategoryClick: (e: FloorPlanCategoryClickEvent) => void;

    onFpConfigured: () => void;

    onDirection: (e: FloorPlanDirectionEvent) => void;

    onDetails: (e: FloorPlanDetailsEvent) => void;

    onExhibitorCustomButtonClick: (e: FloorPlanCustomButtonEvent) => void;

    onGetCoordsClick: (e: FloorPlanGetCoordsEvent) => void;

    onMarkerClick: (e: FloorPlanMarkerEvent) => void;

    selectBooth(nameOrExternalId: string | string[]) {
        nr();
    }

    selectExhibitor(nameOrExternalId: string | string[]) {
        nr();
    }

    selectRoute(startOrWaypoints: RouteWaypoint | RouteWaypoint[], to?: RouteWaypoint): void {
        nr();
    }

    getOptimizedRoutes(waypoints: RouteWaypoint[]): RouteInfo[] {
        nr();
    }

    selectCurrentPosition(point: CurrentPosition, focus: boolean, icon?: number): void {
        nr();
    }

    setBookmarks(bookmarks: { name?: string; externalId?: string; bookmarked: boolean }[]): void {
        nr();
    }

    setMarkers(markersData: MarkersData): void {
        nr();
    }

    updateLayerVisibility(layer: string, visible: boolean): void {
        nr();
    }

    getCenterCoordinates(): any {
        nr();
    }

    applyParameters(parameters: string): void {
        nr();
    }

    exhibitorsList(): any {
        nr();
    }

    boothsList(): any {
        nr();
    }

    categoriesList(): any {
        nr();
    }

    selectCategory(nameOrSlug?: string): void {
        nr();
    }

    getVisibility(): any {
        nr();
    }

    setVisibility(visibility: Visibility): void {
        nr();
    }

    findLocation(): void {
        nr();
    }

    zoomIn(): void {
        nr();
    }

    zoomOut(): void {
        nr();
    }

    switchView(): void {
        nr();
    }

    fitBounds(): void {
        nr();
    }

    getBoothRect(name: string): any {
        nr();
    }

    convertToGeo(x: number, y: number): any {
        nr();
    }

    unstable_destroy(): void {
        nr();
    }

    highlightExhibitors(externalIs: string[]) {
        nr();
    }

    onCurrentPositionChanged(point: CurrentPosition) {
        nr();
    }

    // protected _addCustomCss = async () => { };

    constructor(options?: FloorPlanOptions) {
        this.options = options;
        this.noOverlay = !!options.noOverlay;
        this.offHistory = !!options.offHistory;
        this.allowConsent = options.allowConsent;

        this.onBoothClick = options.onBoothClick;
        this.onBookmarkClick = options.onBookmarkClick;
        this.onCategoryClick = options.onCategoryClick;
        this.onDetails = options.onDetails;
        this.onExhibitorCustomButtonClick = options.onExhibitorCustomButtonClick;
        this.onGetCoordsClick = options.onGetCoordsClick;
        this.onMarkerClick = options.onMarkerClick;
        this.onFpConfigured = options.onFpConfigured;
        this.onDirection = options.onDirection;
        this.onInit = options.onInit;
        this.onCurrentPositionChanged = options.onCurrentPositionChanged;

        this._ready = new Promise((resolve, reject) => {
            this.resolveReady = resolve;
        });

        const element = options.element;
        this.element = element;
        if (element["__expofp"]) throw new Error("Element already in use");
        element["__expofp"] = this;
        const eventId =
            options.eventId ||
            element.getAttribute("data-event-id") ||
            element.getAttribute("data-event") || // legacy remove 2020-12-12
            (document.location.hostname.endsWith(".expofp.com")
                ? document.location.hostname.replace(/\.expofp\.com$/, "")
                : process.env.EFP_DEFAULT_EXPO);
        this.eventId = eventId;
        window["__efpEvent"] = eventId;
        window["__efpBaseUrl"] = baseUrl;
        window["__efpElement"] = element;
        window["__efpElement"] = element;
        const classes = [...element.classList];
        element.classList.remove(...classes);
        element.classList.add("expofp-floorplan-default", ...classes);

        const head = document.head || document.getElementsByTagName("head")[0];

        const style = document.createElement("style");
        head.prepend(style);
        style.textContent = `.expofp-floorplan-default { width: 100%; height: 100%;}`;

        const shadowContainer = document.createElement("div");
        shadowContainer.style.height = "100%";
        shadowContainer.style.width = "100%";
        element.appendChild(shadowContainer);
        let container: HTMLDivElement | ShadowRoot;

        if (eventId === "money2020usa23" && isWebview) {
            this.allowConsent = true;
        }

        if (options.allowConsent === undefined) {
            const url = new URL(window.location.href);
            const cookieConsentParamValue = url.searchParams.get("allowConsent");
            if (cookieConsentParamValue) {
                this.allowConsent = cookieConsentParamValue === "true";
            }
        }

        if (useShadow) {
            container = shadowContainer.attachShadow({ mode: "open" });
            const containerObj = container as any;
            const docObj = document as any;

            containerObj.createElement = (...args) => docObj.createElement(...args);
            containerObj.createElementNS = (...args) => docObj.createElementNS(...args);
            containerObj.createTextNode = (...args) => docObj.createTextNode(...args);
        } else {
            container = shadowContainer;
        }

        const fpContainer = document.createElement("div");
        fpContainer.style.height = "100%";
        fpContainer.style.width = "100%";
        container.appendChild(fpContainer);
        if (useShadow) {
            Object.defineProperty(fpContainer, "ownerDocument", { value: container });
        }
        this.renderTarget = fpContainer;

        const dataUrlBase = options.dataUrl || element.getAttribute("data-data-url") || `https://${eventId}.expofp.com/data/`;
        window["__dataUrlBase"] = dataUrlBase;

        this.dataUrl = dataUrlBase;

        // lazy load floorplan and instantiate it here
        logger.log("Instantiating ExpoFP floorplan", options.element, eventId);

        const dataUrl = dataUrlBase + "data.js";
        const wfDataUrl = dataUrlBase + "wf.data.js";
        const fpUrl = dataUrlBase + "fp.svg.js";

        const promises = [
            initOfflineManager(baseUrl, [wfDataUrl, dataUrl, fpUrl]),
            loadCss("vendor/sanitize-css/sanitize.css", container),
            loadCss("vendor/perfect-scrollbar/css/perfect-scrollbar.css", container),
            loadCss("vendor/mapbox/mapbox-gl.css", container),
            loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-300.woff2", { weight: 300 }),
            loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-500.woff2", { weight: 500 }),
            loadFont("Inter", "fonts/inter-400.woff2", { weight: 400 }),
            loadFont("Inter", "fonts/inter-500.woff2", { weight: 500 }),
            loadFont("Inter", "fonts/inter-600.woff2", { weight: 600 }),
            loadFont("efp-symbols", "fonts/efp-symbols.woff", { weight: 400 }),
            loadJs(wfDataUrl),
            loadJs(dataUrl),
            loadJs(fpUrl),
        ];

        let handledStyleElements = 0;

        this.efpStyleLoadHandler = function (e: Event) {
            const elements = window["__efpStyleElements"] as HTMLStyleElement[];
            while (handledStyleElements < elements.length) {
                const el = elements[handledStyleElements];
                container.appendChild(el);
                handledStyleElements++;
            }
        };

        window.addEventListener("__efpStyleLoad", this.efpStyleLoadHandler);

        const self = this;
        (async function init() {
            await Promise.all(promises);
            let fpVersion = 0;
            while (window["__fpPending"] && !window["__fp"]) {
                await sleep(2000);
                await loadJs(fpUrl + `?v=${++fpVersion}`);
            }
            const data = window["__data"] as Data;

            await initI18n();

            const isHeatmap = window.location.search.startsWith("?heatmap=true");
            if (isHeatmap) {
                const expoId = window["__data"].trackerUrl.match(/expoId=(\d+)/)?.[1];
                const booths = await fetch(`https://app-show.expofp.com/api/fp-stats/get?expoId=${expoId}&type=booview`).then(
                    (res) => res.json()
                );
                const exhibitors = await fetch(`https://app-show.expofp.com/api/fp-stats/get?expoId=${expoId}&type=exview`).then(
                    (res) => res.json()
                );
                window["__heatmapData"] = { booths, exhibitors };
            }

            try {
                const token = getRebookingToken();
                if (token) {
                    retainRebookingToken(token);
                    const url = buildRebookingUrl("api/rebooking-data", token);
                    const resp = await fetch(url);
                    const rebookingData = await resp.json();
                    mergeExhibitors(data as Data, rebookingData as Data);
                }
                data.isRebooking = Boolean(token);
            } catch (error) {
                console.error(error);
            }

            if (data.customCss) {
                // TODO:
                // Enable self._addCustomCss and rerender map after css load
                // self._addCustomCss = async () => {
                const style = document.createElement("style");
                style.textContent = data.customCss;
                document.head.append(style);

                if (useShadow) {
                    const style2 = document.createElement("style");
                    style2.textContent = data.customCss;
                    container.append(style2);
                }

                await loadCustomFonts(data.customCss);
                // }
            }

            try {
                const iconEntries = await Promise.allSettled(
                    Object.entries({
                        "departure": "icons/departure.svg",
                        "destination": "icons/destination.svg",
                        "direction": "icons/direction.svg",
                        "transition": "icons/transition.svg",
                        "transition_up": "icons/transition_up.svg",
                        "transition_down": "icons/transition_down.svg",
                    }).map(([key, path]) =>
                        loadImage(baseUrl ? new URL(path, baseUrl).href : path).then(image => [key, image] as [string, HTMLImageElement])
                    )
                );

                iconEntries
                    .filter((entry): entry is PromiseFulfilledResult<[FloorPlanIcon, HTMLImageElement]> => entry.status === "fulfilled")
                    .map(entry => entry.value)
                    .forEach(([key, icon]) => self.icons.set(key, icon));

            } catch (e) {
                console.warn(e);
            }

            logger.log("Data loaded");
            const { default: FloorPlanReady } = await import(/* webpackChunkName: "floorplan" */ "./floorplan.ready");
            // TODO: legacy, remove in 1/1/2021
            document.querySelectorAll(".expofp-floorplan-loader").forEach((x) => x.remove());
            // remove all kids (loaders)
            while (element.firstChild && element.firstChild !== shadowContainer) {
                element.removeChild(element.firstChild);
            }

            //const fp = new FloorPlanReady.default(options);
            const fpReady = Object.setPrototypeOf(self, FloorPlanReady.prototype);
            fpReady.init();
        })();
    }
}
