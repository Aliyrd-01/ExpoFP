import _locales from "../public/locales/_locales";
import { CurrentPosition } from "./store/RouteStore";
import baseUrl from "./tools/base-url";
import { loadCss, loadFont, loadJs } from "./tools/loaders";
import logger from "./tools/logger";
import { sleep } from "./utils";
import { initI18n } from "./utils/i18n";
import isFromDesigner from "./utils/is-from-designer";
import useShadow from "./utils/use-shadow";

function nr() {
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

    protected resolveReady: () => void;

    get ready() {
        return this._ready;
    }

    // options
    onBoothClick: (e: FloorPlanBoothClickEvent) => void;

    onFpConfigured: () => void;

    onDirection: (e: FloorPlanDirectionEvent) => void;

    onDetails: (e: FloorPlanDetailsEvent) => void;

    selectBooth(nameOrExternalId: string | string[]) {
        nr();
    }

    selectExhibitor(nameOrExternalId: string | string[]) {
        nr();
    }

    selectRoute(from: string, to: string, exceptUnaccessible: boolean): void {
        nr();
    }

    selectCurrentPosition(point: CurrentPosition, focus: boolean): void {
        nr();
    }

    constructor(options?: FloorPlanOptions) {
        this.options = options;
        this.noOverlay = !!options.noOverlay;

        this.onBoothClick = options.onBoothClick;
        this.onDetails = options.onDetails;
        this.onFpConfigured = options.onFpConfigured;
        this.onDirection = options.onDirection;
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

        const shadowContainer = document.createElement("div");
        element.appendChild(shadowContainer);
        let container: HTMLDivElement | ShadowRoot;

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
        container.appendChild(fpContainer);
        if (useShadow) {
            Object.defineProperty(fpContainer, "ownerDocument", { value: container });
        }
        this.renderTarget = fpContainer;

        const dataUrlBase = options.dataUrl || element.getAttribute("data-data-url") || `https://${eventId}.expofp.com/data/`;

        this.dataUrl = dataUrlBase;

        // lazy load floorplan and instantiate it here
        logger.log("Instantiating ExpoFP floorplan", options.element, eventId);

        const dataUrl = dataUrlBase + "data.js";
        const wfDataUrl = dataUrlBase + "wf.data.js";
        const fpUrl = dataUrlBase + "fp.svg.js";

        loadCss("vendor/fa/css/fontawesome-all.min.css", container);
        loadCss("vendor/sanitize-css/sanitize.css", container);
        loadCss("vendor/perfect-scrollbar/css/perfect-scrollbar.css", container);
        // loadCss("fonts/fonts.css", container);

        loadFont("Font Awesome 5 Brands", "vendor/fa/webfonts/fa-brands-400.woff2");

        const fontPromises = [
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-light-300.woff2", { weight: 300 }),
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-regular-400.woff2", { weight: 400 }),
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-solid-900.woff2", { weight: 900 }),
            loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-300.woff2", { weight: 300 }),
            loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-500.woff2", { weight: 500 }),
        ];

        let handledStyleElements = 0;
        window.addEventListener("__efpStyleLoad", function (e: Event) {
            const elements = window["__efpStyleElements"] as HTMLStyleElement[];
            while (handledStyleElements < elements.length) {
                const el = elements[handledStyleElements];
                container.appendChild(el);
                handledStyleElements++;
            }
        });

        const self = this;
        (async function init() {
            await Promise.all([...fontPromises, loadJs(dataUrl), loadJs(wfDataUrl), loadJs(fpUrl)]);
            let fpVersion = 0;
            while (window["__fpPending"] && !window["__fp"]) {
                await sleep(2000);
                await loadJs(fpUrl + `?v=${++fpVersion}`);
            }
            const data = window["__data"] as Data;

            const navLanguage = navigator.languages?.[0] || navigator.language;
            const navLocale = _locales.find((x) => navLanguage.startsWith(x));
            await initI18n(navLocale || data.locale || "en");

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
