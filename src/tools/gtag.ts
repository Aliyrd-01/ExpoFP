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

    ClickDirections = "Click Directions",
}

export function sendEventToGa(action: GaEventActions, label: string, eventCategory?: string,) {
    //for reference https://developers.google.com/analytics/devguides/collection/ga4/reference/events
    switch (action) {
        case GaEventActions.View:
        case GaEventActions.ViewGallery:
        case GaEventActions.ViewVideo:
            gtag("event", "select_content", {
                content_type: action,
                content_id: label
            });
            break;
        case GaEventActions.Search:
            gtag("event", "search", {
                search_term: label
            });
            break;
        case GaEventActions.ClickCustomButton:
        case GaEventActions.ClickPhone:
        case GaEventActions.ClickEmail:
        case GaEventActions.ClickWebsite:
        case GaEventActions.ClickFacebook:
        case GaEventActions.ClickInstagaram:
        case GaEventActions.ClickLinkedin:
        case GaEventActions.ClickTwitter:
        case GaEventActions.ClickGooglePlus:
        case GaEventActions.ClickXing:
        case GaEventActions.ClickYoutube:
            gtag("event", "share", {
                //method: action,
                content_type: action,
                content_id: label
            });
            break;
        case GaEventActions.ClickDirections:
            gtag("event", "route", {
                content_type: action,
                content_id: label
            });
            break;
        default:
            gtag("event", action, {
                content_type: eventCategory,
                content_id: label,
            });
    }

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
