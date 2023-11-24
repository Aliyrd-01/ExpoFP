import data from "../data";
import settings from "../tools/settings";
import isDebug from "../utils/is-debug";

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
    Rendered = "Floor plan rendered",
}

export function hasUserConsent(allowConsent?: boolean): "granted" | "denied" | undefined {
    if (allowConsent === false || allowConsent === true) return allowConsent ? "granted" : "denied";

    const consentCookie = document.cookie.split("; ").find((cookie) => cookie.startsWith("cookie_consent="));

    if (consentCookie) {
        const hasCookieConsent = consentCookie === "cookie_consent=true";
        return hasCookieConsent ? "granted" : "denied";
    }

    return undefined;
}

export function setCookieConsent(cookieConsent: boolean) {
    const monthInSeconds = 2592000;

    const domain = isDebug ? "localhost" : ".expofp.com";
    document.cookie = cookieConsent
        ? `cookie_consent=${cookieConsent}; max-age=${monthInSeconds}; domain=${domain}; path=/`
        : `cookie_consent=${cookieConsent}; max-age=${monthInSeconds}; path=/`;
}

function deleteGaCookies() {
    const cookies = document.cookie.split(";");
    const domain = isDebug ? "localhost" : ".expofp.com";

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith("_ga")) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
        }
    }
}

export function setConsentSettings(allowConsent?: boolean) {
    let analyticsConsent = hasUserConsent(allowConsent);

    if (analyticsConsent) {
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

        gtag("consent", "update", {
            analytics_storage: analyticsConsent,
        });
    }
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

gtag("config", ga_common_prop, { fp_key: settings.EXPO });
window["gtag"] = gtag;

gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    'region': ["BE", "BG", "CZ", "DK", "DE", "EE", "IE", "EL", "ES", "FR", "HR", "IT", "CY", "LV", "LT", "LU", "HU", "MT", "NL", "AT", "PL", "PT", "RO",
        "SI", "SK", "FI", "SE", "UK", "IS", "NO", "LI", "CH", "MK", "AL", "RS", "TR"],
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "denied",
});

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
