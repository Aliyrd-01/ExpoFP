import baseUrl from "./tools/base-url";
import { loadCss, loadFont, loadJson, preloadJs, preloadJson, preloadFont } from "./tools/loaders";
import logger from "./tools/logger";
import { sleep } from "./utils";
import useShadow from "./utils/use-shadow";
import Rect from "./core/Rect";

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
    readonly meshUrl: string;
    readonly noOverlay: boolean;
    svg: SvgJson;
    data: Data;

    protected resolveReady: () => void;

    get ready() {
        return this._ready;
    }

    // options
    onBoothClick: (e: FloorPlanBoothClickEvent) => void;

    selectBooth(name: string) {
        nr();
    }

    constructor(options?: FloorPlanOptions) {
        this.options = options;
        this.noOverlay = !!options.noOverlay;

        this.onBoothClick = options.onBoothClick;
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

        const dataUrl = dataUrlBase + "data.json";
        const fpUrl = dataUrlBase + "fp.json";
        this.meshUrl = dataUrlBase + "fp.mesh.json";

        preloadJson(dataUrl);
        preloadJson(fpUrl);
        preloadJson(this.meshUrl);
        preloadJs("floorplan.js");
        preloadJs("vendors~floorplan.js");
        preloadFont("fonts/oswald-v17-cyrillic_latin-300.woff2");
        preloadFont("fonts/oswald-v17-cyrillic_latin-500.woff2");

        loadCss("vendor/fa/css/fontawesome-all.min.css", container);
        loadCss("vendor/sanitize-css/sanitize.css", container);
        loadCss("vendor/perfect-scrollbar/css/perfect-scrollbar.css", container);
        // loadCss("fonts/fonts.css", container);

        loadFont("Font Awesome 5 Brands", "vendor/fa/webfonts/fa-brands-400.woff2");

        const fontPromises = [
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-light-300.woff2", { weight: 300 }),
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-regular-400.woff2", { weight: 400 }),
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-solid-900.woff2", { weight: 900 })
            // loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-300.woff2", { weight: 300 }),
            // loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-500.woff2", { weight: 500 })
        ];

        let handledStyleElements = 0;
        window.addEventListener("__efpStyleLoad", function(e: Event) {
            const elements = window["__efpStyleElements"] as HTMLStyleElement[];
            while (handledStyleElements < elements.length) {
                const el = elements[handledStyleElements];
                container.appendChild(el);
                handledStyleElements++;
            }
        });

        const self = this;
        (async function init() {
            await Promise.all([
                ...fontPromises,
                (async function() {
                    self.data = await loadJson<Data>(dataUrl);
                })(),
                (async function() {
                    self.svg = await loadJson<SvgJson>(fpUrl);
                })()
            ]);
            let fpVersion = 0;
            while (self.svg.pending) {
                await sleep(1500);
                self.svg = await loadJson<SvgJson>(fpUrl + `?v=${++fpVersion}`);
            }
            self.svg.area = Rect.fromSvgJsonRect(self.svg.area);
            self.svg.viewBox = Rect.fromSvgJsonRect(self.svg.viewBox);
            logger.log("Data loaded");
            const { default: FloorPlanReady } = await import(/* webpackChunkName: "floorplan" */ "./floorplan.ready");
            // TODO: legacy, remove in 1/1/2021
            document.querySelectorAll(".expofp-floorplan-loader").forEach(x => x.remove());
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
