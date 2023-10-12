import data from "../data";
import settings from "../tools/settings";
import { isLocalStorageAvailable } from "../utils/localStorage";

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

function hasUserConsent(allowConsent?: boolean): boolean {
    if (allowConsent === false || allowConsent === true) return allowConsent;

    // if allowConsent === undefined
    return isLocalStorageAvailable ? localStorage.getItem("userCookieChoice") === "true" : false;
}

function deleteGaCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith("_ga")) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.expofp.com";
        }
    }
}

export function setConsentSettings(allowConsent?: boolean) {
    let analyticsConsent = hasUserConsent(allowConsent) ? "granted" : "denied";

    if (analyticsConsent === "denied") {
        deleteGaCookies();

        if (data.gtag) {
            window[`ga-disable-${data.gtag}`] = true;
        }
        window[`ga-disable-${ga_common_prop}`] = true;
    } else {
        if (data.gtag) {
            window[`ga-disable-${data.gtag}`] = false;
        }
        window[`ga-disable-${ga_common_prop}`] = false;
    }

    gtag("consent", "default", {
        ad_storage: "denied",
        analytics_storage: analyticsConsent,
        functionality_storage: "denied",
        personalization_storage: "denied",
        security_storage: "denied",
    });
}

export function sendEventToGa(action: GaEventActions, label: string, eventCategory?: string) {
    //for reference https://developers.google.com/analytics/devguides/collection/ga4/reference/events
    switch (action) {
        case GaEventActions.ViewBooth:
        case GaEventActions.ViewExhibitor:
        case GaEventActions.ViewCategory:
        case GaEventActions.ViewGallery:
        case GaEventActions.ViewVideo:
            gtag("event", "select_content", {
                content_type: action,
                content_id: label,
            });
            break;
        case GaEventActions.Search:
            gtag("event", "search", {
                search_term: label,
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
                content_id: label,
            });
            break;
        case GaEventActions.ClickDirections:
            gtag("event", "route", {
                content_type: action,
                content_id: label,
            });
            break;
        default:
            gtag("event", action, {
                content_type: eventCategory,
                content_id: label,
            });
    }
}

let v: HTMLScriptElement | null;
let s: HTMLScriptElement | null;

let isGtagInitialized = false;

export function initializeGtag(allowConsent?: boolean) {
    console.error(allowConsent, hasUserConsent(allowConsent));
    if (!hasUserConsent(allowConsent)) return;

    if (!v) {
        v = document.createElement("script");
        v.type = "text/javascript";
        v.async = true;
        v.src = `https://www.googletagmanager.com/gtag/js?id=${ga_common_prop}`;
        const vx = document.getElementsByTagName("script")[0];
        vx.parentNode.insertBefore(v, vx);
        gtag("js", new Date());
    }

    if (data.gtag && !s) {
        s = document.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${data.gtag}`;
        const x = document.getElementsByTagName("script")[0];
        x.parentNode.insertBefore(s, x);

        gtag("config", data.gtag, { fp_key: settings.EXPO });
    }

    if (!isGtagInitialized) {
        setConsentSettings(allowConsent);
        gtag("config", ga_common_prop, { fp_key: settings.EXPO });
        window["gtag"] = gtag;
        isGtagInitialized = true;
    }
}

export function destroyGtag() {
    if (v && v.parentNode) {
        v.parentNode.removeChild(v);
        v = null;
    }

    if (s && s.parentNode) {
        s.parentNode.removeChild(s);
        s = null;
    }
}
