import "array-flat-polyfill";
import ready from "document-ready";
import FloorPlanLoader from "./floorplan.loader";
import "./public-path.js";
import reportError from "./tools/report-error";
import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

window.addEventListener("error", reportError);
window["__efpStyleElements"] = [];

initializeFaro({
    url: "https://faro-collector-prod-us-central-0.grafana.net/collect/dc8f20431166062c2f7b2bc09e7c8f71",
    app: {
        name: "efp-app",
        version: "1.0.0",
        environment: "production"
    },
    instrumentations: [
        // Mandatory, omits default instrumentations otherwise.
        ...getWebInstrumentations(),
        // Tracing package to get end-to-end visibility for HTTP requests.
        new TracingInstrumentation(),
    ],
    sessionTracking: {
        session: {
            // @ts-ignore
            attributes: { publicPath: __webpack_public_path__ },
        },
    }
});

ready(async () => {
    const floorplanDivs = document.querySelectorAll(".expofp-floorplan") as NodeListOf<HTMLDivElement>;
    for (const element of Array.from(floorplanDivs)) {
        window["___fp"] = new FloorPlanLoader({ element });
    }
});

export const FloorPlan = FloorPlanLoader;
