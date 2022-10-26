import "array-flat-polyfill";
import ready from "document-ready";
import FloorPlanLoader from "./floorplan.loader";
import "./public-path.js";
import reportError from "./tools/report-error";

if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js?v=4").then(() => {});

window.addEventListener("error", reportError);
window["__efpStyleElements"] = [];

ready(async () => {
    const floorplanDivs = document.querySelectorAll(".expofp-floorplan") as NodeListOf<HTMLDivElement>;
    for (const element of Array.from(floorplanDivs)) {
        window["fp"] = new FloorPlanLoader({ element });
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
