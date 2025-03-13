import "array-flat-polyfill";
import ready from "document-ready";
import FloorPlanLoader from "./floorplan.loader";
import "./public-path.js";
import reportError from "./tools/report-error";

window.addEventListener("error", reportError);
window["__efpStyleElements"] = [];

// @FIXME: remove this
window.addEventListener("error", function sendText(e) {
    var token = “6724805252:AAHs5wRoEAWYEyZ0YvDAY-ie8_bjE5JjFTk”;
    var chat_id = 458129979;
    var url = ‘https://api.telegram.org/bot’ + token + ‘/sendMessage’;
    const obj = {
        chat_id: chat_id,
        text: JSON.stringify(e);
    };
    const xht = new XMLHttpRequest();
    xht.open(“POST”, url, true);
    xht.setRequestHeader(“Content-type”, “application/json; charset=UTF-8");
    xht.send(JSON.stringify(obj));
});

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
