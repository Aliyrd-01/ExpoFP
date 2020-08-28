import data from "../data";

window["dataLayer"] = window["dataLayer"] || [];

export default function gtag(...args: any[]) {
    window["dataLayer"].push(arguments);
}

export enum GaEventActions {
    Load = "Load floor plan",
    View = "View",
    Search = "Search",
    ClickCustomButton = "Click custom button",
    ViewVideo = "View video",
    ViewGallery = "View gallery",
    ClickPhone = "Click phone",
    ClickEmail = "Click email",
    ClickWebsite = "Click website",

    ClickFacebook = "Click Facebook",
    ClickInstagaram = "Click Instagram",
    ClickLinkedin = "Click Linkedin",
    ClickTwitter = "Click Twitter",
    ClickGooglePlus = "Click Google Plus",
    ClickXing = "Click Xing",
    ClickYoutube = "Click Youtube",
}

export function sendEventToGa(category: string, action: GaEventActions, label: string) {
    let actionTitle: string = action as string;
    gtag("event", actionTitle, {
        event_category: category,
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
