import data from "../data";

window["dataLayer"] = window["dataLayer"] || [];

export default function gtag(...args: any[]) {
    window["dataLayer"].push(arguments);
}

export enum GaEventActions {
    Load = "Load floor plan",
    ViewExhibitor = "View exhibitor",
    ViewBooth = `View booth`,
    ClickCustomButton = "Click custom button",
    ViewCategory = `View category`,
    ViewVideo = "View video",
    ViewGallery = "View gallery",
    ClickOnPhone = "Click phone",
    ClickOnEmail = "Click email",
    ClickOnWebsite = "Click website",
    ClickSocialLink = "Click social link",
}

export function sendEventToGa(category: string, action: GaEventActions, label: string) {
    let actionTitle: string = <string>action;
    if (action === GaEventActions.ViewBooth) actionTitle = `View`;
    else if (action === GaEventActions.ViewExhibitor) actionTitle = `View`;
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
