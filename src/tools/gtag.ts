import data from "../data";

window["dataLayer"] = window["dataLayer"] || [];

export default function gtag(...args: any[]) {
    window["dataLayer"].push(arguments);
}

export enum GaEventActions {
    Load = "Load floor plan",
    ViewExhibitor = "View exhibitor",
    ClickExhibitorButton = "Click exhibitor button",
}

export function sendEventToGa(action: GaEventActions, label: string) {
    gtag("event", action, {
        event_category: "floorplan",
        event_label: label,
    });
}

if (data.gtag) {
    // insert script
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${data.gtag}`;
    const x = document.getElementsByTagName("script")[0];
    x.parentNode.insertBefore(s, x);

    // initial view
    gtag("js", new Date());
    gtag("config", data.gtag, { transport_type: "beacon" });
}

window["gtag"] = gtag;
