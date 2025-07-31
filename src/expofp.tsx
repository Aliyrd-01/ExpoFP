import "array-flat-polyfill";
import ready from "document-ready";
import FloorPlanLoader from "./floorplan.loader";
import "./public-path.js";
import reportError from "./tools/report-error";

// import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
// import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// initializeFaro({
//     url: "https://faro-collector-prod-us-central-0.grafana.net/collect/dc8f20431166062c2f7b2bc09e7c8f71",
//     app: {
//         name: "efp-app",
//         version: "1.0.0",
//         environment: "production"
//     },
//     instrumentations: [
//         // Mandatory, omits default instrumentations otherwise.
//         ...getWebInstrumentations(),
//         // Tracing package to get end-to-end visibility for HTTP requests.
//         new TracingInstrumentation(),
//     ],
// });

(function () {
    var webSdkScript = document.createElement("script");

    // fetch the latest version of the Web-SDK from the CDN
    webSdkScript.src =
        "https://unpkg.com/@grafana/faro-web-sdk@latest/dist/bundle/faro-web-sdk.iife.js";

    webSdkScript.onload = () => {
        // @ts-ignore
        window.GrafanaFaroWebSdk.initializeFaro({
            url: "https://faro-collector-prod-us-central-0.grafana.net/collect/dc8f20431166062c2f7b2bc09e7c8f71",
            app: {
                name: "efp-app",
                version: "1.0.0",
                environment: "production",
            },

        });


        // Load instrumentations at the onLoad event of the web-SDK and after the above configuration.
        // This is important because we need to ensure that the Web-SDK has been loaded and initialized before we add further instruments!
        var webTracingScript = document.createElement("script");

        // fetch the latest version of the Web Tracing package from the CDN
        webTracingScript.src =
            "https://unpkg.com/@grafana/faro-web-tracing@latest/dist/bundle/faro-web-tracing.iife.js";

        // Initialize, configure (if necessary) and add the the new instrumentation to the already loaded and configured Web-SDK.
        webTracingScript.onload = () => {
            // @ts-ignore
            window.GrafanaFaroWebSdk.faro.instrumentations.add(
                // @ts-ignore
                new window.GrafanaFaroWebTracing.TracingInstrumentation()
            );
        };

        // Append the Web Tracing script script tag to the HTML page
        document.head.appendChild(webTracingScript);
    };

    // Append the Web-SDK script script tag to the HTML page
    document.head.appendChild(webSdkScript);
})();

window.addEventListener("error", reportError);
window["__efpStyleElements"] = [];

ready(async () => {
    const floorplanDivs = document.querySelectorAll(".expofp-floorplan") as NodeListOf<HTMLDivElement>;
    for (const element of Array.from(floorplanDivs)) {
        window["___fp"] = new FloorPlanLoader({ element });
    }
});

export const FloorPlan = FloorPlanLoader;

/*
floorplan loader
    requires all resources
 
floorplan ready
    in context
    has reference to store
    store has reference to fp
    observable props (part of store)

init store somehow with 

*/
