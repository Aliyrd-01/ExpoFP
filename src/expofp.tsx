import "array-flat-polyfill";
import ready from "document-ready";
import FloorPlanLoader from "./floorplan.loader";
import "./public-path.js";
import reportError from "./tools/report-error";
import { OfflineManager } from "./offline/OfflineManager";

window.addEventListener("error", reportError);
window["__efpStyleElements"] = [];

const currentScriptSrc = (document.currentScript as HTMLScriptElement)?.src;
const swUrl = currentScriptSrc ? new URL("sw.js", currentScriptSrc).href : "sw.js";
const command = new URLSearchParams(window.location.search).get("__sw");
const offlineManager = new OfflineManager();

ready(async () => {
    if (command === "1") {
        await offlineManager.register(swUrl, "/");
    } else if (command === "0") {
        await offlineManager.unregister(swUrl);
    }

    const floorplanDivs = document.querySelectorAll(".expofp-floorplan") as NodeListOf<HTMLDivElement>;
    for (const element of Array.from(floorplanDivs)) {
        window["___fp"] = new FloorPlanLoader({
            element,
            onInit: fp => {
                // offlineManager.cache(
                //     [
                //         "data.js",
                //         "data-internal.js",
                //         "wf.data.js",
                //         "fp.svg.js"
                //     ].map(path => fp.dataUrl ? new URL(path, fp.dataUrl).href : path),
                // );
            }
        });
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
