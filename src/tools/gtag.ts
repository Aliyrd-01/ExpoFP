import data from "../data";
import settings from "../tools/settings";

const ga_common_prop = "G-78CKLYWFJK";

window["dataLayer"] = window["dataLayer"] || [];

export default function gtag(...args: any[]) {
    window["dataLayer"].push(arguments);
}

export enum GaEventActions {
    Load = "Load floor plan",
    ViewBooth = "View booth",
    ViewExhibitor = "View exhibitor",
    ViewCategory = "View category",
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
        case GaEventActions.ViewBooth:
        case GaEventActions.ViewExhibitor:
        case GaEventActions.ViewCategory:
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

const v = document.createElement("script");
v.type = "text/javascript";
v.async = true;
v.src = `https://www.googletagmanager.com/gtag/js?id=${ga_common_prop}`;
const vx = document.getElementsByTagName("script")[0];
vx.parentNode.insertBefore(v, vx);

gtag("js", new Date());

if (data.gtag) {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${data.gtag}`;
    const x = document.getElementsByTagName("script")[0];
    x.parentNode.insertBefore(s, x);

    gtag("config", data.gtag, { fp_key: settings.EXPO });
}
gtag("config", ga_common_prop, { fp_key: settings.EXPO });

window["gtag"] = gtag;
